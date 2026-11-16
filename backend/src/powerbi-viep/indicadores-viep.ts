import { ValorDsr } from './dsr';
import { coluna, medida, ModeloPainel, nivelData, PowerBiClient, soma } from './powerbi.client';

// Painéis da Vigilância Epidemiológica (VIEP) de Divinópolis usados aqui. As chaves vêm dos
// botões da tela inicial https://app.powerbi.com/view?r=eyJrIjoiZWJhMDQzOGItOGQ3Ny00MTQ1LTg2ZmQtNzJkNzViMDQwZjM4...
export const PAINEIS_VIEP = {
  nascidosVivos: { chave: 'adef2dda-8b5b-4cdc-b13e-2fe60b0c82fb', nome: 'Painel VIEP - Nascidos Vivos' },
  sifilis: { chave: '31c6b4e2-74f6-462a-b961-d56f865553a1', nome: 'Painel VIEP - Sífilis' },
  mortalidadeInfantil: { chave: '7be2f78d-f93e-43fa-8010-0dc436cca9ca', nome: 'Painel VIEP - Mortalidade Infantil' },
  obitoMaterno: { chave: 'd04cbdaf-ca3e-483f-9121-e5b37b43dcea', nome: 'Painel VIEP - Óbito Materno' },
  aids: { chave: '5a727f24-05a7-4a59-b242-9bf3b16a413f', nome: 'Painel VIEP - Aids' },
} as const;

export type NomePainel = keyof typeof PAINEIS_VIEP;
export type Paineis = Record<NomePainel, ModeloPainel>;

// Uma observação = um período com numerador e denominador já somados.
// `denominador: null` indica contagem absoluta (o resultado é o próprio numerador).
export interface Observacao {
  periodo: string; // AAAA-MM-01
  numerador: number;
  denominador: number | null;
}

export interface IndicadorViep {
  codigo: string;
  painel: NomePainel;
  // Escala só documenta como o dashboard exibe (o resultado gravado é sempre a fração crua).
  unidade: 'percentual' | 'por 1.000 NV' | 'por 100 mil NV' | 'quantidade';
  coletar(client: PowerBiClient, paineis: Paineis, anoInicial: number): Promise<Observacao[]>;
}

// ---- Normalização --------------------------------------------------------------------

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export function numero(v: ValorDsr): number {
  if (v === null || v === '') return 0;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Valor numérico inválido vindo do Power BI: ${v}`);
  return n;
}

// Ano pode vir como 2026 ou "2026".
export function ano(v: ValorDsr): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n > 1900 && n < 3000 ? n : null;
}

// Mês pode vir como 1, "01", "janeiro" ou como data em milissegundos (colunas MÊS do painel).
export function mes(v: ValorDsr): number | null {
  if (v === null) return null;
  if (typeof v === 'string') {
    const nome = MESES.indexOf(v.trim().toLowerCase());
    if (nome >= 0) return nome + 1;
  }
  const n = Number(v);
  if (Number.isInteger(n) && n >= 1 && n <= 12) return n;
  if (Number.isFinite(n) && n > 1e11) return new Date(n).getUTCMonth() + 1;
  return null;
}

export const periodo = (a: number, m: number) => `${a}-${String(m).padStart(2, '0')}-01`;

// Soma `valor` por período (ano/mês), ignorando linhas sem data válida ou anteriores ao ano inicial.
export function somarPorMes(
  linhas: ValorDsr[][],
  anoInicial: number,
  coluna: (linha: ValorDsr[]) => { ano: ValorDsr; mes: ValorDsr; valor: ValorDsr; incluir?: boolean },
): Map<string, number> {
  const total = new Map<string, number>();
  for (const linha of linhas) {
    const c = coluna(linha);
    if (c.incluir === false) continue;
    const a = ano(c.ano), m = mes(c.mes);
    if (a === null || m === null || a < anoInicial) continue;
    const p = periodo(a, m);
    total.set(p, (total.get(p) ?? 0) + numero(c.valor));
  }
  return total;
}

// Junta numerador e denominador. Só gera períodos que têm denominador positivo;
// mês sem nenhuma notificação no numerador vale zero (o painel não devolve linha vazia).
export function razaoMensal(numeradores: Map<string, number>, denominadores: Map<string, number>): Observacao[] {
  return [...denominadores.entries()]
    .filter(([, d]) => d > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([p, d]) => ({ periodo: p, numerador: numeradores.get(p) ?? 0, denominador: d }));
}

// Todos os meses de janeiro do ano inicial até o mês de `ate` (inclusive).
export function mesesAte(anoInicial: number, ate: Date): string[] {
  const meses: string[] = [];
  for (let a = anoInicial; a <= ate.getUTCFullYear(); a++) {
    const ultimo = a === ate.getUTCFullYear() ? ate.getUTCMonth() + 1 : 12;
    for (let m = 1; m <= ultimo; m++) meses.push(periodo(a, m));
  }
  return meses;
}

// Idade no SINAN (NU_IDADE_N): 1º dígito é a unidade (1 hora, 2 dia, 3 mês, 4 ano), o resto o valor.
export function menorDeUmAno(idadeSinan: ValorDsr): boolean {
  const n = Number(idadeSinan);
  if (!Number.isInteger(n) || n < 1000) return false;
  const unidade = Math.floor(n / 1000);
  return unidade >= 1 && unidade <= 3;
}

// ---- Nascidos Vivos: todas as proporções são contagem / total de nascidos no mês -----

const NV = { f: 'FNascidos Vivos', m: '_Medidas' };
const anoMesNascimento = [coluna('f', 'Ano Nasc'), coluna('f', 'Mês Nasc')];

async function totaisNascidosVivos(client: PowerBiClient, paineis: Paineis, anoInicial: number, medidaNumerador: string) {
  const linhas = await client.consultar(paineis.nascidosVivos, NV, [...anoMesNascimento, medida('m', medidaNumerador), medida('m', 'Total Nasc')]);
  const num = somarPorMes(linhas, anoInicial, l => ({ ano: l[0], mes: l[1], valor: l[2] }));
  const den = somarPorMes(linhas, anoInicial, l => ({ ano: l[0], mes: l[1], valor: l[3] }));
  return razaoMensal(num, den);
}

// Distribui o total de nascidos por uma categoria e conta só as categorias de interesse.
export function proporcaoPorCategoria(linhas: ValorDsr[][], anoInicial: number, categorias: string[]): Observacao[] {
  const num = somarPorMes(linhas, anoInicial, l => ({ ano: l[0], mes: l[1], valor: l[3], incluir: categorias.includes(String(l[2])) }));
  const den = somarPorMes(linhas, anoInicial, l => ({ ano: l[0], mes: l[1], valor: l[3] }));
  return razaoMensal(num, den);
}

const proporcaoNascidos = (codigo: string, medidaNumerador: string): IndicadorViep => ({
  codigo, painel: 'nascidosVivos', unidade: 'percentual',
  coletar: (client, paineis, anoInicial) => totaisNascidosVivos(client, paineis, anoInicial, medidaNumerador),
});

const porCategoriaNascidos = (codigo: string, campo: string, categorias: string[]): IndicadorViep => ({
  codigo, painel: 'nascidosVivos', unidade: 'percentual',
  async coletar(client, paineis, anoInicial) {
    const linhas = await client.consultar(paineis.nascidosVivos, NV, [...anoMesNascimento, coluna('f', campo), medida('m', 'Total Nasc')]);
    return proporcaoPorCategoria(linhas, anoInicial, categorias);
  },
});

// ---- Sífilis: casos / nascidos vivos do próprio painel (mesma conta das taxas exibidas) --

const sifilis = (codigo: string, tabela: string, data: string, medidaCasos: string): IndicadorViep => ({
  codigo, painel: 'sifilis', unidade: 'por 1.000 NV',
  async coletar(client, paineis, anoInicial) {
    const casos = await client.consultar(paineis.sifilis, { c: tabela, m: '_Medidas' },
      [nivelData('c', data, 'Ano'), nivelData('c', data, 'Mês'), medida('m', medidaCasos)]);
    const nascidos = await client.consultar(paineis.sifilis, { n: 'Nascidos Vivos', m: '_Medidas' },
      [coluna('n', 'Ano'), coluna('n', 'Mes'), medida('m', 'NascVivos')]);
    return razaoMensal(
      somarPorMes(casos, anoInicial, l => ({ ano: l[0], mes: l[1], valor: l[2] })),
      somarPorMes(nascidos, anoInicial, l => ({ ano: l[0], mes: l[1], valor: l[2] })),
    );
  },
});

// ---- Lista dos indicadores (itens 1 a 12 da planilha do professor) -------------------

export const INDICADORES_VIEP: IndicadorViep[] = [
  // 1 e 2
  sifilis('VIEP_SIFILIS_GESTANTE', 'sif gest', 'DT_NOTIFIC', 'GEstConf'),
  sifilis('VIEP_SIFILIS_CONGENITA', 'sif cong', 'DT_DIAG', 'TotalCong'),
  // 3: casos novos de Aids em menores de 1 ano (contagem). Meses sem caso valem zero
  // até o mês da última atualização do painel.
  {
    codigo: 'VIEP_AIDS_MENOR_1_ANO', painel: 'aids', unidade: 'quantidade',
    async coletar(client, paineis, anoInicial) {
      const linhas = await client.consultar(paineis.aids, { c: 'FCrianças', m: '_Medidas' },
        [nivelData('c', 'Data Diagnóstico', 'Ano'), nivelData('c', 'Data Diagnóstico', 'Mês'), coluna('c', 'Idade'), medida('m', 'Criança')]);
      const casos = somarPorMes(linhas, anoInicial, l => ({ ano: l[0], mes: l[1], valor: l[3], incluir: menorDeUmAno(l[2]) }));
      const ate = paineis.aids.ultimaAtualizacao ? new Date(paineis.aids.ultimaAtualizacao) : new Date();
      return mesesAte(anoInicial, ate).map(p => ({ periodo: p, numerador: casos.get(p) ?? 0, denominador: null }));
    },
  },
  // 4: óbitos infantis / nascidos vivos, por mês, da tabela que alimenta o gráfico de índices
  {
    codigo: 'VIEP_MORTALIDADE_INFANTIL', painel: 'mortalidadeInfantil', unidade: 'por 1.000 NV',
    async coletar(client, paineis, anoInicial) {
      const linhas = await client.consultar(paineis.mortalidadeInfantil, { i: 'ÍNDICES MÊS' },
        [coluna('i', 'MÊS'), soma('i', 'ÓBITOS INF'), soma('i', 'NASC VIVOS')]);
      // A coluna ANO dessa tabela tem erros de digitação (jul/2026 aparece como 2027);
      // a coluna MÊS é uma data completa, então ano e mês saem dela.
      const anoDaData = (v: ValorDsr) => (v === null ? null : new Date(Number(v)).getUTCFullYear());
      return razaoMensal(
        somarPorMes(linhas, anoInicial, l => ({ ano: anoDaData(l[0]), mes: l[0], valor: l[1] })),
        somarPorMes(linhas, anoInicial, l => ({ ano: anoDaData(l[0]), mes: l[0], valor: l[2] })),
      );
    },
  },
  // 5: o painel só publica a razão por ano (tabela "Indicadores"); gravamos um período anual
  // em janeiro, marcado no mapeamento como periodicidade anual.
  {
    codigo: 'VIEP_MORTALIDADE_MATERNA', painel: 'obitoMaterno', unidade: 'por 100 mil NV',
    async coletar(client, paineis, anoInicial) {
      const linhas = await client.consultar(paineis.obitoMaterno, { i: 'Indicadores' },
        [coluna('i', 'ANO'), soma('i', 'ÓBITO MATERNO'), soma('i', 'NASCIDOS VIVOS')]);
      return linhas
        .map(l => ({ a: ano(l[0]), numerador: numero(l[1]), denominador: numero(l[2]) }))
        .filter((l): l is { a: number; numerador: number; denominador: number } => l.a !== null && l.a >= anoInicial && l.denominador > 0)
        .sort((x, y) => x.a - y.a)
        .map(l => ({ periodo: periodo(l.a, 1), numerador: l.numerador, denominador: l.denominador }));
    },
  },
  // 6 a 10
  proporcaoNascidos('VIEP_GRAVIDEZ_ADOLESCENCIA', 'Adolescentes'),
  proporcaoNascidos('VIEP_PARTOS_NORMAIS', 'PartoVag'),
  proporcaoNascidos('VIEP_PARTOS_CESAREOS', 'PartoCes'),
  proporcaoNascidos('VIEP_BAIXO_PESO', 'Baixo Peso'),
  proporcaoNascidos('VIEP_PREMATURIDADE', 'Prematuros'),
  // 11: fatia "7 ou mais" sobre o total de nascidos (inclui "Ignorado" no total, como o painel)
  porCategoriaNascidos('VIEP_7_CONSULTAS_PRENATAL', 'Faixa Consultas', ['7 ou mais']),
  // 12: o painel só tem o mês de gestação do início do pré-natal; até o 3º mês ≈ até a 12ª semana
  porCategoriaNascidos('VIEP_PRENATAL_ATE_12_SEMANAS', 'Mes Inic. PN', ['1', '2', '3']),
];
