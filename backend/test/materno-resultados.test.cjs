const { test } = require('node:test');
const assert = require('node:assert/strict');
const { construirResultados, MAPEAMENTO_MATERNO } = require('../dist/materno-importacao/materno-resultados');
const row = (extra = {}) => ({ periodo_referencia: '2026-08-01', codigo_indicador: '2017', tipo_atendimento: 'SUS', detalhamento: 'Sem detalhamento', resultado: 0.5, numerador: 1, denominador: 2, relatorio_fonte: 'Relatório teste', atualizado_em: '2026-09-01', ...extra });
const indicator = (rows, id = 'mi37') => construirResultados(rows).indicators.find(x => x.id === id);

test('mapeamento explícito e códigos não suportados', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(MAPEAMENTO_MATERNO).map(([code, x]) => [code, x.id])), { 2017:'mi37', 2097:'mi38', 2103:'mi35', 2015:'mi34', 2014:'mi36', PORTA_MEDICO:'mi32', PA_PREPARTO:'mi33', ICSAP:'mi12', PARTOS:'mi08',
    VIEP_SIFILIS_GESTANTE:'mi02', VIEP_SIFILIS_CONGENITA:'mi03', VIEP_AIDS_MENOR_1_ANO:'mi04', VIEP_MORTALIDADE_INFANTIL:'mi05', VIEP_MORTALIDADE_MATERNA:'mi06',
    VIEP_GRAVIDEZ_ADOLESCENCIA:'mi07', VIEP_BAIXO_PESO:'mi09', VIEP_PREMATURIDADE:'mi10', VIEP_7_CONSULTAS_PRENATAL:'mi13', VIEP_PRENATAL_ATE_12_SEMANAS:'mi31' });
  // Partos do Power BI ficam fora da tela enquanto mi08 vier da planilha.
  assert.equal(MAPEAMENTO_MATERNO.VIEP_PARTOS_NORMAIS, undefined);
  for (const code of ['CRITERIOS_RN_RISCO', 'CRI_MENOR_5', 'CRI_6_A_9', 'mi37']) assert.equal(indicator([row({ codigo_indicador: code })]).latest, null);
});
test('razão ponderada, escala percentual e exclusão de totais/subconjuntos', () => {
  const result = indicator([row(), row({ tipo_atendimento: 'Saúde suplementar', numerador: 9, denominador: 10 }), row({ tipo_atendimento: 'Geral', numerador: 100, denominador: 100 }), row({ detalhamento: 'Subconjunto', numerador: 100, denominador: 100 })]);
  assert.equal(result.latest.value, 10 / 12 * 100);
  assert.equal(result.status, 'unevaluated');
  assert.equal(result.parameter, null);
  assert.equal(result.trend, null);
});
test('média ponderada e apenas Todas as classificações nos tempos', () => {
  for (const [code, id] of [['PORTA_MEDICO', 'mi32'], ['PA_PREPARTO', 'mi33']]) {
    const rows = [row({ codigo_indicador: code, tipo_atendimento:'Geral', detalhamento:'Todas as classificações', numerador:220, denominador:10 }), row({ codigo_indicador:code, tipo_atendimento:'Geral', detalhamento:'Azul e verde', numerador:900, denominador:10 })];
    assert.equal(indicator(rows, id).latest.value, 22);
    assert.equal(indicator(rows.slice(1), id).latest.value, null);
  }
  assert.equal(indicator([row({codigo_indicador:'2097', numerador:10, denominador:2}),row({codigo_indicador:'2097',tipo_atendimento:'Saúde suplementar',numerador:90,denominador:10})], 'mi38').latest.value,100/12);
});
test('último período por indicador; nulos/denominador zero não viram resultados', () => {
  for (const extra of [{numerador:null}, {denominador:null}, {denominador:0}]) {
    const r = indicator([row({periodo_referencia:'2026-07-01'}), row(extra)]);
    assert.equal(r.latest.period,'2026-08');
    assert.equal(r.latest.value,null);
    assert.equal(r.quadrimester[0].value,null);
  }
  assert.equal(indicator([]).latest,null);
  assert.equal(indicator([row({resultado:0,numerador:0})]).latest.value,0);
});
test('mensal e quadrimestral consolidam componentes; fronteiras e parciais', () => {
  const r = indicator([row({periodo_referencia:'2026-04-01'}), row({periodo_referencia:'2026-05-01'}),row({periodo_referencia:'2026-06-01',numerador:9,denominador:10}),row({periodo_referencia:'2026-07-01'}),row({periodo_referencia:'2026-09-01'})]);
  assert.equal(r.monthly[1].value,50);
  assert.equal(r.quadrimester[1].value,11/14*100);
  assert.equal(r.quadrimester[1].label,'mai–ago/2026 · parcial');
  assert.deepEqual(r.quadrimester.map(x=>x.period),['2026-01','2026-05','2026-09']);
  const complete = indicator([5,6,7,8].map(m=>row({periodo_referencia:`2026-0${m}-01`})));
  assert.equal(complete.quadrimester[0].partial,false);
});
const births = (period, counts) => [
  ['SUS','Parto normal - alto risco'],['SUS','Parto normal - risco habitual'],['Saúde suplementar','Parto normal - sem estratificação de risco'],
  ['SUS','Parto cesáreo - alto risco'],['SUS','Parto cesáreo - risco habitual'],['Saúde suplementar','Parto cesáreo - sem estratificação de risco'],
].map(([tipo_atendimento,detalhamento],i)=>row({codigo_indicador:'PARTOS',periodo_referencia:period,tipo_atendimento,detalhamento,resultado:counts[i],numerador:null,denominador:null}));
test('PARTOS preserva dois resultados, soma estratos exclusivos e pondera quadrimestre', () => {
  const august = births('2026-08-01',[22,52,19,15,14,53]);
  const r = indicator([...august, ...births('2026-07-01',[1,0,0,0,0,0]),row({codigo_indicador:'PARTOS',detalhamento:'Total',resultado:1000})], 'mi08');
  assert.equal(r.latest.normal,93/175*100);
  assert.equal(r.latest.cesareo,82/175*100);
  assert.equal(r.latest.value,null);
  assert.equal(r.quadrimester[0].normal,94/176*100);
  assert.equal(indicator(august.slice(1),'mi08').latest.normal,null);
});

test('mês sem atendimentos não impede consolidação quando os componentes são zero explícito', () => {
  const r = indicator([row({periodo_referencia:'2026-07-01',numerador:0,denominador:0}),row()]);
  assert.equal(r.monthly[0].value,null);
  assert.equal(r.quadrimester[0].value,50);
});

const viep = (extra = {}) => row({ codigo_indicador: 'VIEP_PREMATURIDADE', tipo_atendimento: 'Geral', relatorio_fonte: 'Painel VIEP - Nascidos Vivos', ...extra });
test('VIEP: razão ponderada só com tipo Geral e escala por mil', () => {
  const r = indicator([viep({ numerador: 21, denominador: 223 }), viep({ tipo_atendimento: 'SUS', numerador: 999, denominador: 1 })], 'mi10');
  assert.equal(r.latest.value, 21 / 223 * 100);
  assert.equal(r.frequency, 'Mensal');
  assert.deepEqual(r.sources, ['Painel VIEP - Nascidos Vivos']);
  const s = indicator([row({ codigo_indicador: 'VIEP_SIFILIS_GESTANTE', tipo_atendimento: 'Geral', numerador: 6, denominador: 2000 })], 'mi02');
  assert.equal(s.latest.value, 3);
});
test('VIEP: contagem de Aids soma casos, inclusive zero', () => {
  const aids = (p, n) => row({ codigo_indicador: 'VIEP_AIDS_MENOR_1_ANO', tipo_atendimento: 'Geral', periodo_referencia: p, numerador: n, denominador: null, resultado: n });
  const r = indicator([aids('2026-05-01', 0), aids('2026-06-01', 1), aids('2026-07-01', 2), aids('2026-08-01', 0)], 'mi04');
  assert.equal(r.latest.value, 0);
  assert.equal(r.quadrimester.find(q => q.period === '2026-05').value, 3);
});
test('VIEP: mortalidade materna é anual, sem quadrimestres', () => {
  const om = (p, n, d) => row({ codigo_indicador: 'VIEP_MORTALIDADE_MATERNA', tipo_atendimento: 'Geral', periodo_referencia: p, numerador: n, denominador: d });
  const r = indicator([om('2024-01-01', 4, 2326), om('2025-01-01', 0, 2560)], 'mi06');
  assert.equal(r.frequency, 'Anual');
  assert.deepEqual(r.monthly.map(m => [m.period, m.label]), [['2024', '2024'], ['2025', '2025']]);
  assert.equal(r.monthly[0].value, 4 / 2326 * 100000);
  assert.equal(r.latest.value, 0);
  assert.deepEqual(r.quadrimester, []);
});

const ieps = (codigo, ano, detalhamento, numerador, denominador = 100) => row({ codigo_indicador: codigo, periodo_referencia: `${ano}-01-01`, tipo_atendimento: 'Geral', detalhamento, numerador, denominador, resultado: numerador / denominador, relatorio_fonte: 'IEPS Data' });
test('IEPS: códigos equivalentes entram na consulta e só nos indicadores mapeados', () => {
  const { CODIGOS_RESULTADOS } = require('../dist/materno-importacao/materno-resultados');
  for (const code of ['IEPS_BAIXO_PESO', 'IEPS_PREMATURIDADE', 'IEPS_7_CONSULTAS_PRENATAL', 'IEPS_PRENATAL_1_TRIMESTRE', 'IEPS_MORTALIDADE_INFANTIL', 'IEPS_ICSAP']) assert.ok(CODIGOS_RESULTADOS.includes(code), code);
  assert.equal(indicator([ieps('IEPS_BAIXO_PESO', 2024, 'Minas Gerais', 10)], 'mi37').comparison, null);
});
test('IEPS: MG e Brasil na escala do indicador; Divinópolis do IEPS nos anos fechados e nossos dados nos demais', () => {
  const rows = [
    ieps('IEPS_PREMATURIDADE', 2023, 'Divinópolis', 11.2), ieps('IEPS_PREMATURIDADE', 2024, 'Divinópolis', 12),
    ieps('IEPS_PREMATURIDADE', 2023, 'Minas Gerais', 11.9), ieps('IEPS_PREMATURIDADE', 2024, 'Brasil', 12.4),
    viep({ periodo_referencia: '2026-01-01', numerador: 21, denominador: 200 }), viep({ periodo_referencia: '2026-02-01', numerador: 19, denominador: 200 }),
  ];
  const r = indicator(rows, 'mi10');
  assert.deepEqual(r.comparison.state.map(x => [x.period, x.value]), [['2023', 11.9]]);
  assert.deepEqual(r.comparison.country.map(x => [x.period, x.value]), [['2024', 12.4]]);
  assert.equal(r.comparison.source, 'IEPS Data');
  assert.deepEqual(r.annual.map(x => [x.period, x.source, x.partial]), [['2023', 'IEPS Data', false], ['2024', 'IEPS Data', false], ['2026', null, true]]);
  assert.equal(r.annual[1].value, 12);
  assert.equal(r.annual[2].value, 40 / 400 * 100);
  assert.equal(r.annual[2].label, '2026 · parcial');
  // IEPS não altera o mensal nem as fontes do card.
  assert.deepEqual(r.monthly.map(x => x.period), ['2026-01', '2026-02']);
  assert.deepEqual(r.sources, ['Painel VIEP - Nascidos Vivos']);
});
test('IEPS: mortalidade infantil por mil e ICSAP como razão das taxas', () => {
  const mi = indicator([ieps('IEPS_MORTALIDADE_INFANTIL', 2024, 'Minas Gerais', 11.5, 1000)], 'mi05');
  assert.equal(mi.comparison.state[0].value, 11.5);
  assert.deepEqual(mi.comparison.country, []);
  const icsap = indicator([ieps('IEPS_ICSAP', 2025, 'Brasil', 1200, 6000)], 'mi12');
  assert.equal(icsap.comparison.country[0].value, 20);
});
test('ano local completo e passado não é parcial', () => {
  const r = indicator(Array.from({ length: 12 }, (_, i) => viep({ periodo_referencia: `2025-${String(i + 1).padStart(2, '0')}-01`, numerador: 1, denominador: 10 })), 'mi10');
  assert.deepEqual(r.annual.map(x => [x.label, x.partial, x.value]), [['2025', false, 10]]);
});
