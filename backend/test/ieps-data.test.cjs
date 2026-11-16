const { test } = require('node:test');
const assert = require('node:assert/strict');
const { lerCsv, extrairObservacoes, paraLinhas, urlCsvIeps, INDICADORES_IEPS, descartarRepeticoes } = require('../dist/ieps-data/indicadores-ieps');

// Trecho real do CSV do IEPS (16/11/2026), com uma linha de outro município e uma de região.
const CABECALHO = 'Ano,"Código IBGE",Nome,"Nível ",Região,"UF (IBGE)",UF,"Macrorregião de Saúde (IBGE)","Macrorregião de Saúde","Região de Saúde (IBGE)","Região de Saúde","Nascidos Vivos com Baixo Peso (%)","Nascidos Vivos Prematuros (%)","Consultas Pré-Natal: 7+ (%)","Mortalidade Infantil (Por 1.000 NVs - IBGE)","Nascidos Vivos com Início do Pré-natal no 1º Trimestre de Gestação (%)","Hospitalizações (Por 100.000 Hab.)","Hospitalizações CSAP (Por 100.000 Hab.)"';
const CSV = [
  CABECALHO,
  '2025,31,"Minas Gerais",Estado,Sudeste,31,MG,,,,,10.462286,11,83.03904931,,85.49083481,7081.806054,1214.512429',
  '2024,31,"Minas Gerais",Estado,Sudeste,31,MG,,,,,10.462286,11,83.03904931,10.97163846,85.49083481,7300.07765,1242.746518',
  '2023,31,"Minas Gerais",Estado,Sudeste,31,MG,,,,,10.27933104,10,81.7254912,11.14612233,85.41997982,6807.194913,1198.297147',
  '2025,312230,Divinópolis,Município,Sudeste,31,MG,3105,Oeste,31086,Divinópolis,10.5760963,12,83.57695615,,93.55116079,4443.659861,465.9602682',
  '2024,312230,Divinópolis,Município,Sudeste,31,MG,3105,Oeste,31086,Divinópolis,10.5760963,12,83.57695615,,93.55116079,4178.633918,437.836321',
  '2023,312230,Divinópolis,Município,Sudeste,31,MG,3105,Oeste,31086,Divinópolis,11.04536489,13,82.87968442,,90.8086785,3930.526368,341.8029587',
  '2024,31086,Divinópolis,"Região de Saúde",Sudeste,31,MG,3105,Oeste,31086,Divinópolis,99,99,99,99,99,99,99',
  '2024,310010,"Abadia dos Dourados",Município,Sudeste,31,MG,,,,,99,99,99,,99,99,99',
  '2024,BR,Brasil,País,,,,,,,,9.486517272,10,79.03353654,12.24883034,83.30512199,6649.462624,1029.384419',
  '',
].join('\n');

const obs = extrairObservacoes(CSV);
const de = (codigo, local) => obs.get(codigo).filter(o => o.detalhamento === local).map(o => o.ano);

test('lê CSV com aspas, aspas duplas, CRLF e campos vazios', () => {
  assert.deepEqual(lerCsv('a,"b ""x"", c",\r\n1,,3\n'), [['a', 'b "x", c', ''], ['1', '', '3']]);
});

test('URL pede todos os indicadores numa chamada só', () => {
  const url = new URL(urlCsvIeps());
  assert.equal(url.searchParams.get('tipo'), 'todos');
  assert.equal(url.searchParams.get('ano'), 'todos');
  assert.deepEqual(url.searchParams.get('indicador').split(','),
    ['pct_baixo_peso', 'pct_prematuro', 'pct_prenatal_7m', 'pct_prenatal_1tri', 'tx_mort_inf_ibge', 'tx_hosp_csap', 'tx_hosp']);
});

test('só Divinópolis (município), MG e Brasil entram; região de saúde e outros municípios não', () => {
  for (const o of [...obs.values()].flat()) assert.ok(['Divinópolis', 'Minas Gerais', 'Brasil'].includes(o.detalhamento));
  assert.ok(!obs.get('IEPS_BAIXO_PESO').some(o => o.numerador === 99));
});

test('ano repetido do anterior (2025 = 2024) é descartado, ano com valor próprio fica', () => {
  assert.deepEqual(de('IEPS_BAIXO_PESO', 'Divinópolis'), [2023, 2024]);
  assert.deepEqual(de('IEPS_BAIXO_PESO', 'Minas Gerais'), [2023, 2024]);
  assert.deepEqual(de('IEPS_ICSAP', 'Divinópolis'), [2023, 2024, 2025]);
});

test('mortalidade infantil sem valor para município não gera linha', () => {
  assert.deepEqual(de('IEPS_MORTALIDADE_INFANTIL', 'Divinópolis'), []);
  assert.deepEqual(de('IEPS_MORTALIDADE_INFANTIL', 'Brasil'), [2024]);
});

test('linhas no formato de materno_resultados: fração crua, local no detalhamento e fonte IEPS', () => {
  const baixoPeso = INDICADORES_IEPS.find(i => i.codigo === 'IEPS_BAIXO_PESO');
  const [linha] = paraLinhas(baixoPeso, obs.get('IEPS_BAIXO_PESO').filter(o => o.detalhamento === 'Brasil'), '2026-11-16T00:00:00.000Z');
  assert.deepEqual(linha, {
    periodo_referencia: '2024-01-01', codigo_indicador: 'IEPS_BAIXO_PESO', tipo_atendimento: 'Geral', detalhamento: 'Brasil',
    resultado: 9.486517272 / 100, numerador: 9.486517272, denominador: 100, unidade_medida: 'percentual', justificativa: null,
    relatorio_fonte: 'IEPS Data', data_registro: null, area_responsavel: 'Instituto de Estudos para Políticas de Saúde (IEPS)',
    situacao_dado: 'Coletado automaticamente do IEPS Data', atualizado_em: '2026-11-16T00:00:00.000Z',
  });
  const mort = INDICADORES_IEPS.find(i => i.codigo === 'IEPS_MORTALIDADE_INFANTIL');
  assert.equal(paraLinhas(mort, obs.get('IEPS_MORTALIDADE_INFANTIL'), 'x')[0].resultado * 1000, 12.24883034);
});

test('ICSAP em % = taxa CSAP ÷ taxa total de internações', () => {
  const div2024 = obs.get('IEPS_ICSAP').find(o => o.detalhamento === 'Divinópolis' && o.ano === 2024);
  assert.equal(div2024.numerador / div2024.denominador, 437.836321 / 4178.633918);
});

test('coluna faltando no CSV (nome mudou no IEPS) é erro, não dado vazio', () => {
  const semPrematuro = CSV.replace('"Nascidos Vivos Prematuros (%)"', '"Prematuros"');
  assert.throws(() => extrairObservacoes(semPrematuro), /Nascidos Vivos Prematuros \(%\)/);
  assert.throws(() => extrairObservacoes(''), /vazio/);
});

test('repetição só conta para anos seguidos no mesmo local', () => {
  const o = (ano, detalhamento, numerador) => ({ ano, detalhamento, numerador, denominador: 100 });
  assert.equal(descartarRepeticoes([o(2020, 'Brasil', 5), o(2022, 'Brasil', 5), o(2022, 'Minas Gerais', 5)]).length, 3);
});
