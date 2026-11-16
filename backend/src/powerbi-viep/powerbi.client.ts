import { decodificarDsr, ValorDsr } from './dsr';

// API pública que a própria página "Publicar na Web" do Power BI usa por baixo.
// Não é uma API documentada pela Microsoft: se mudar, as consultas falham com erro
// explícito (nunca gravamos valor parcial).
export const API_POWERBI = 'https://wabi-brazil-south-b-primary-api.analysis.windows.net';

export interface ModeloPainel {
  chave: string;
  modelId: number;
  datasetId: string;
  reportId: string;
  // Última vez que a VIEP publicou/atualizou os dados do painel (ISO, UTC).
  ultimaAtualizacao: string | null;
}

// ---- Construtores das expressões da consulta semântica -----------------------------

export type Selecao = Record<string, unknown> & { Name: string };

const ref = (fonte: string) => ({ SourceRef: { Source: fonte } });

export const coluna = (fonte: string, propriedade: string): Selecao => ({
  Column: { Expression: ref(fonte), Property: propriedade },
  Name: `${fonte}.${propriedade}`,
});

export const medida = (fonte: string, propriedade: string): Selecao => ({
  Measure: { Expression: ref(fonte), Property: propriedade },
  Name: `${fonte}.${propriedade}`,
});

export const soma = (fonte: string, propriedade: string): Selecao => ({
  Aggregation: { Expression: { Column: { Expression: ref(fonte), Property: propriedade } }, Function: 0 },
  Name: `Sum(${fonte}.${propriedade})`,
});

// Nível ("Ano" ou "Mês") da hierarquia automática de datas de uma coluna de data.
export const nivelData = (fonte: string, propriedade: string, nivel: 'Ano' | 'Mês'): Selecao => ({
  HierarchyLevel: {
    Expression: {
      Hierarchy: {
        Expression: { PropertyVariationSource: { Expression: ref(fonte), Name: 'Variation', Property: propriedade } },
        Hierarchy: 'Hierarquia de datas',
      },
    },
    Level: nivel,
  },
  Name: `${fonte}.${propriedade}.${nivel}`,
});

// ---- Cliente -----------------------------------------------------------------------

type Fetch = typeof fetch;

export class PowerBiClient {
  constructor(private readonly fetchFn: Fetch = fetch, private readonly api = API_POWERBI) {}

  private async post(chave: string, caminho: string, corpo: unknown) {
    const resposta = await this.fetchFn(`${this.api}${caminho}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-PowerBI-ResourceKey': chave },
      body: JSON.stringify(corpo),
    });
    if (!resposta.ok) throw new Error(`Power BI respondeu ${resposta.status} em ${caminho}.`);
    return resposta.json();
  }

  async modelo(chave: string): Promise<ModeloPainel> {
    const resposta = await this.fetchFn(
      `${this.api}/public/reports/${chave}/modelsAndExploration?preferReadOnlySession=true`,
      { headers: { 'X-PowerBI-ResourceKey': chave } },
    );
    if (!resposta.ok) throw new Error(`Power BI respondeu ${resposta.status} ao abrir o painel ${chave}.`);
    const corpo: any = await resposta.json();
    const modelo = corpo?.models?.[0];
    const reportId = corpo?.exploration?.report?.objectId;
    if (!modelo?.id || !modelo?.dbName || !reportId) {
      throw new Error(`Estrutura inesperada no painel ${chave}.`);
    }
    const ultima = typeof modelo.LastRefreshTime === 'string' ? modelo.LastRefreshTime : null;
    return {
      chave,
      modelId: modelo.id,
      datasetId: modelo.dbName,
      reportId,
      ultimaAtualizacao: ultima ? new Date(`${ultima.replace(/Z?$/, '')}Z`).toISOString() : null,
    };
  }

  // Consulta agrupada: devolve uma linha por combinação das colunas, na ordem de `selecao`.
  async consultar(
    painel: ModeloPainel,
    entidades: Record<string, string>,
    selecao: Selecao[],
  ): Promise<ValorDsr[][]> {
    const query = {
      Version: 2,
      From: Object.entries(entidades).map(([Name, Entity]) => ({ Name, Entity, Type: 0 })),
      Select: selecao,
    };
    const corpo = {
      version: '1.0.0',
      queries: [{
        Query: { Commands: [{ SemanticQueryDataShapeCommand: {
          Query: query,
          Binding: {
            Primary: { Groupings: [{ Projections: selecao.map((_, i) => i) }] },
            DataReduction: { DataVolume: 4, Primary: { Window: { Count: 30000 } } },
            Version: 1,
          },
        } }] },
        QueryId: '',
        ApplicationContext: { DatasetId: painel.datasetId, Sources: [{ ReportId: painel.reportId }] },
      }],
      cancelQueries: [],
      modelId: painel.modelId,
    };
    const resposta: any = await this.post(painel.chave, '/public/reports/querydata?synchronous=true', corpo);
    const dsr = resposta?.results?.[0]?.result?.data?.dsr;
    if (!dsr?.DS?.[0] || dsr.DataShapes?.some((d: any) => d?.['odata.error']) || dsr.DS[0]['odata.error']) {
      const erro = JSON.stringify(dsr ?? resposta).slice(0, 300);
      throw new Error(`Consulta ao Power BI falhou (${selecao.map(s => s.Name).join(', ')}): ${erro}`);
    }
    return decodificarDsr(dsr.DS[0]);
  }
}
