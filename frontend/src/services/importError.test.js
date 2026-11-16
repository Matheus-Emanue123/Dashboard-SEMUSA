import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeImportError, formatRowErrors } from './importError.js';

const http = (status, body = {}) => ({ status, body, message: body.message });

test('colunas ausentes: lista as colunas e a aba', () => {
  const d = describeImportError(http(400, { tipo: 'colunas', aba: 'Cadastro Indicadores', colunasAusentes: ['tipo_atendimento', 'detalhamento'] }));
  assert.equal(d.title, 'Planilha fora do padrão');
  assert.equal(d.sheet, 'Cadastro Indicadores');
  assert.deepEqual(d.missingColumns, ['tipo_atendimento', 'detalhamento']);
  assert.match(d.found, /Faltam 2 colunas/);
  assert.equal(d.canRetry, true);
});

test('abas ausentes: marca cada aba esperada como encontrada ou não', () => {
  const d = describeImportError(http(400, { tipo: 'abas', abasEsperadas: ['Cadastro Indicadores', 'Referência'], abasAusentes: ['Referência'] }));
  assert.deepEqual(d.sheets, [{ name: 'Cadastro Indicadores', ok: true }, { name: 'Referência', ok: false }]);
});

test('linhas com erro: título com a contagem e as linhas preservadas', () => {
  const erros = [{ linha: 14, motivo: 'detalhamento vazio' }, { linha: 22, motivo: 'tipo_atendimento vazio' }];
  const d = describeImportError(http(400, { tipo: 'linhas', erros }));
  assert.equal(d.title, '2 linhas com erro');
  assert.equal(d.rows, erros);
  assert.equal(formatRowErrors(erros), 'Linha 14: detalhamento vazio\nLinha 22: tipo_atendimento vazio');
  assert.equal(describeImportError(http(400, { tipo: 'linhas', erros: [erros[0]] })).title, '1 linha com erro');
});

test('erros locais de arquivo e tamanho, sem status HTTP', () => {
  assert.equal(describeImportError({ tipo: 'arquivo' }).title, 'Arquivo não reconhecido');
  assert.equal(describeImportError({ tipo: 'tamanho' }).title, 'Arquivo grande demais');
  assert.equal(describeImportError(http(413)).title, 'Arquivo grande demais');
});

test('sessão, permissão e servidor não oferecem reenvio; servidor não afirma que nada foi gravado', () => {
  for (const status of [401, 403, 500]) assert.equal(describeImportError(http(status)).canRetry, false);
  assert.doesNotMatch(describeImportError(http(500)).subtitle, /Nenhum dado/);
  assert.equal(describeImportError({ message: 'Failed to fetch' }).title, 'Sem conexão com o servidor');
});

test('resposta 400 sem tipo conhecido mostra a mensagem do servidor', () => {
  assert.equal(describeImportError(http(400, { message: 'Algo novo' })).found, 'Algo novo');
});
