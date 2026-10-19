const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Workbook } = require('exceljs');
const { lerPlanilha } = require('../dist/materno-importacao/planilha.parser');

function planilhaBase() {
  const wb = new Workbook();
  wb.addWorksheet('Referência').addRows([['codigo_indicador', 'unidade_medida'], ['MI01', '%']]);
  wb.addWorksheet('Cadastro Indicadores').addRow([
    'periodo_referencia', 'codigo_indicador', 'tipo_atendimento', 'detalhamento',
    'resultado_informado', 'numerador', 'denominador', 'justificativa_observacao',
    'relatorio_fonte', 'data_do_registro', 'area_responsavel', 'situacao_do_dado',
  ]);
  return wb;
}

test('periodo_referencia como número de série (sem formatação de data) ainda é lido corretamente', () => {
  const wb = planilhaBase();
  // célula perdeu a formatação de data e ficou como número puro; 46023 = 2026-01-02
  wb.getWorksheet('Cadastro Indicadores').addRow([46023, 'MI01', 'Pré-natal', 'UBS teste', 80]);
  const leitura = lerPlanilha(wb, new Date().toISOString());
  assert.deepEqual(leitura.erros, []);
  assert.equal(leitura.linhas[0].periodo_referencia, '2026-01-01');
});

test('periodo_referencia como texto dd/mm/aaaa não é confundido com mm/dd/aaaa', () => {
  const wb = planilhaBase();
  wb.getWorksheet('Cadastro Indicadores').addRow(['01/02/2026', 'MI01', 'Pré-natal', 'UBS teste', 80]);
  const leitura = lerPlanilha(wb, new Date().toISOString());
  assert.deepEqual(leitura.erros, []);
  assert.equal(leitura.linhas[0].periodo_referencia, '2026-02-01');
});

test('periodo_referencia com texto que não é uma data válida gera erro, não dado incorreto', () => {
  const wb = planilhaBase();
  wb.getWorksheet('Cadastro Indicadores').addRow(['32/13/2026', 'MI01', 'Pré-natal', 'UBS teste', 80]);
  const leitura = lerPlanilha(wb, new Date().toISOString());
  assert.equal(leitura.linhas.length, 0);
  assert.deepEqual(leitura.erros, [{ linha: 2, motivo: 'periodo_referencia vazio ou não é uma data' }]);
});

test('codigo_indicador fora da aba Referência é rejeitado mesmo com tipo_atendimento preenchido', () => {
  const wb = planilhaBase();
  wb.getWorksheet('Cadastro Indicadores').addRow([new Date('2026-10-01'), 'NAO_EXISTE', 'Pré-natal', 'UBS teste', 80]);
  const leitura = lerPlanilha(wb, new Date().toISOString());
  assert.equal(leitura.linhas.length, 0);
  assert.deepEqual(leitura.erros, [{ linha: 2, motivo: 'código NAO_EXISTE não existe na aba Referência' }]);
});
