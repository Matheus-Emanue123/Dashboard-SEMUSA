import { LinhaResultado } from '../materno-importacao/planilha.parser';

// IEPS Data (https://iepsdata.org.br): indicadores calculados do mesmo jeito para município,
// estado e Brasil. Usados no comparativo Divinópolis × MG × Brasil (issues #107 e #36).
// Endpoint descoberto no botão "Download de dados" do site. Devolve um CSV (UTF-8, vírgula,
// ponto decimal) com uma linha por local e ano, e uma coluna por indicador pedido.
export const URL_CSV_IEPS = 'https://iepsdata.org.br/wp-json/caleidosapi/get_csv';
export const FONTE_IEPS = 'IEPS Data';

// Locais comparados. `detalhamento` é o que vai para a coluna de mesmo nome no banco.
export const LOCAIS_IEPS = [
  { codigoIbge: '312230', nivel: 'Município', detalhamento: 'Divinópolis' },
  { codigoIbge: '31', nivel: 'Estado', detalhamento: 'Minas Gerais' },
  { codigoIbge: 'BR', nivel: 'País', detalhamento: 'Brasil' },
] as const;

// Uma coluna do CSV: `parametro` é o nome pedido na URL; `coluna`, o título que volta no CSV.
interface ColunaIeps {
  parametro: string;
  coluna: string;
}

export interface IndicadorIeps {
  codigo: string;
  unidade: 'percentual' | 'por 1.000 NV';
  // Valor publicado = numerador / denominador × escala. Para os indicadores simples o
  // denominador é a própria escala (100 ou 1000) e o resultado gravado é a fração crua,
  // igual ao padrão do módulo powerbi-viep.
  numerador: ColunaIeps;
  denominador: ColunaIeps | number;
}

const pct = (codigo: string, parametro: string, coluna: string): IndicadorIeps =>
  ({ codigo, unidade: 'percentual', numerador: { parametro, coluna }, denominador: 100 });

export const INDICADORES_IEPS: IndicadorIeps[] = [
  pct('IEPS_BAIXO_PESO', 'pct_baixo_peso', 'Nascidos Vivos com Baixo Peso (%)'),
  pct('IEPS_PREMATURIDADE', 'pct_prematuro', 'Nascidos Vivos Prematuros (%)'),
  pct('IEPS_7_CONSULTAS_PRENATAL', 'pct_prenatal_7m', 'Consultas Pré-Natal: 7+ (%)'),
  pct('IEPS_PRENATAL_1_TRIMESTRE', 'pct_prenatal_1tri', 'Nascidos Vivos com Início do Pré-natal no 1º Trimestre de Gestação (%)'),
  // O IEPS não publica mortalidade infantil por município: só MG e Brasil terão linhas.
  {
    codigo: 'IEPS_MORTALIDADE_INFANTIL', unidade: 'por 1.000 NV',
    numerador: { parametro: 'tx_mort_inf_ibge', coluna: 'Mortalidade Infantil (Por 1.000 NVs - IBGE)' },
    denominador: 1000,
  },
  // O IEPS só publica taxas por 100 mil habitantes. Como as duas taxas usam a mesma população,
  // CSAP ÷ total dá o % de internações por CSAP, igual ao nosso mi12.
  {
    codigo: 'IEPS_ICSAP', unidade: 'percentual',
    numerador: { parametro: 'tx_hosp_csap', coluna: 'Hospitalizações CSAP (Por 100.000 Hab.)' },
    denominador: { parametro: 'tx_hosp', coluna: 'Hospitalizações (Por 100.000 Hab.)' },
  },
];

export function colunasIeps(indicadores = INDICADORES_IEPS): ColunaIeps[] {
  const todas = indicadores.flatMap(i => typeof i.denominador === 'number' ? [i.numerador] : [i.numerador, i.denominador]);
  return [...new Map(todas.map(c => [c.parametro, c])).values()];
}

export function urlCsvIeps(indicadores = INDICADORES_IEPS): string {
  // `tipo=todos` porque o filtro não aceita mais de um nível por vez; os locais são filtrados aqui.
  const params = new URLSearchParams({ ano: 'todos', tipo: 'todos', indicador: colunasIeps(indicadores).map(c => c.parametro).join(',') });
  return `${URL_CSV_IEPS}?${params}`;
}

// ---- CSV ---------------------------------------------------------------------------------

// Leitor de CSV simples (RFC 4180): aspas opcionais, "" dentro de aspas, quebras LF ou CRLF.
export function lerCsv(texto: string): string[][] {
  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = '';
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ',') { linha.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      linha.push(campo); campo = '';
      if (linha.length > 1 || linha[0] !== '') linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  if (campo !== '' || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas;
}

// ---- Extração ----------------------------------------------------------------------------

export interface Observacao {
  ano: number;
  detalhamento: string;
  numerador: number;
  denominador: number;
}

function valor(texto: string | undefined): number | null {
  if (texto === undefined || texto.trim() === '') return null;
  const n = Number(texto);
  if (!Number.isFinite(n)) throw new Error(`Valor numérico inválido vindo do IEPS: ${texto}`);
  return n;
}

// Lê o CSV e devolve, por código de indicador, as observações dos locais comparados.
// Lança erro se alguma coluna esperada não veio: o IEPS ignora em silêncio nomes de indicador
// desconhecidos, então uma coluna faltando quer dizer que eles mudaram o nome.
export function extrairObservacoes(csv: string, indicadores = INDICADORES_IEPS): Map<string, Observacao[]> {
  const [cabecalho, ...linhas] = lerCsv(csv.replace(/^﻿/, ''));
  if (!cabecalho) throw new Error('CSV do IEPS veio vazio.');
  const titulos = cabecalho.map(t => t.trim());
  const indice = (titulo: string) => {
    const i = titulos.indexOf(titulo);
    if (i < 0) throw new Error(`Coluna "${titulo}" não veio no CSV do IEPS (o nome pode ter mudado).`);
    return i;
  };
  const iAno = indice('Ano');
  const iCodigo = indice('Código IBGE');
  const iNivel = indice('Nível');
  const colunas = new Map(colunasIeps(indicadores).map(c => [c.parametro, indice(c.coluna)]));

  const resultado = new Map<string, Observacao[]>(indicadores.map(i => [i.codigo, []]));
  for (const linha of linhas) {
    const local = LOCAIS_IEPS.find(l => l.codigoIbge === linha[iCodigo] && l.nivel === linha[iNivel]);
    if (!local) continue;
    const ano = Number(linha[iAno]);
    if (!Number.isInteger(ano)) throw new Error(`Ano inválido vindo do IEPS: ${linha[iAno]}`);
    for (const ind of indicadores) {
      const numerador = valor(linha[colunas.get(ind.numerador.parametro)!]);
      const denominador = typeof ind.denominador === 'number' ? ind.denominador : valor(linha[colunas.get(ind.denominador.parametro)!]);
      if (numerador === null || denominador === null || denominador === 0) continue;
      resultado.get(ind.codigo)!.push({ ano, detalhamento: local.detalhamento, numerador, denominador });
    }
  }
  for (const [codigo, obs] of resultado) resultado.set(codigo, descartarRepeticoes(obs));
  return resultado;
}

// Quando o DATASUS ainda não fechou um ano, o IEPS repete o valor do ano anterior
// (ex.: SINASC de 2025 = 2024). Um ano idêntico ao anterior no mesmo local é descartado,
// para o comparativo não mostrar um dado que não existe.
export function descartarRepeticoes(observacoes: Observacao[]): Observacao[] {
  const ordenadas = [...observacoes].sort((a, b) => a.detalhamento.localeCompare(b.detalhamento) || a.ano - b.ano);
  return ordenadas.filter((o, i) => {
    const anterior = ordenadas[i - 1];
    return !(anterior && anterior.detalhamento === o.detalhamento && anterior.ano === o.ano - 1
      && anterior.numerador === o.numerador && anterior.denominador === o.denominador);
  });
}

// Converte as observações de um indicador nas linhas da tabela materno_resultados.
export function paraLinhas(indicador: IndicadorIeps, observacoes: Observacao[], agora: string): LinhaResultado[] {
  return observacoes.map(o => ({
    // Dado anual: gravado em janeiro, como os outros indicadores anuais.
    periodo_referencia: `${o.ano}-01-01`,
    codigo_indicador: indicador.codigo,
    tipo_atendimento: 'Geral',
    // O nível geográfico (Divinópolis, Minas Gerais ou Brasil) fica no detalhamento.
    detalhamento: o.detalhamento,
    resultado: o.numerador / o.denominador,
    numerador: o.numerador,
    denominador: o.denominador,
    unidade_medida: indicador.unidade,
    justificativa: null,
    relatorio_fonte: FONTE_IEPS,
    data_registro: null,
    area_responsavel: 'Instituto de Estudos para Políticas de Saúde (IEPS)',
    situacao_dado: 'Coletado automaticamente do IEPS Data',
    atualizado_em: agora,
  }));
}
