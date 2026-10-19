const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { generateKeyPairSync, sign } = require('node:crypto');
const { Workbook } = require('exceljs');
const { NestFactory } = require('@nestjs/core');
const { ConfigService } = require('@nestjs/config');
const { Module } = require('@nestjs/common');
const { AuthModule } = require('../dist/auth/auth.module');
const { MaternoImportacaoModule } = require('../dist/materno-importacao/materno-importacao.module');
const { MaternoImportacaoService } = require('../dist/materno-importacao/materno-importacao.service');

// Exercises the real JWT/JWKS, global guards, multipart interceptor and parser.
// Only persistence is replaced; no credentials or external services are used.
test('importação HTTP com autenticação e autorização reais', async (t) => {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'local-test', use: 'sig', alg: 'ES256' };
  const jwks = createServer((_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ keys: [jwk] }));
  });
  await new Promise((resolve) => jwks.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => jwks.close(resolve)));
  const supabaseUrl = `http://127.0.0.1:${jwks.address().port}`;
  const previous = { ...process.env };
  process.env.SUPABASE_URL = supabaseUrl;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-test-key';
  t.after(() => {
    for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
  // Provide config explicitly so the test never loads .env files.
  class TestModule {}
  const { Global } = require('@nestjs/common');
  class TestConfigModule {}
  Global()(TestConfigModule);
  Module({ providers: [{ provide: ConfigService, useValue: new ConfigService({ SUPABASE_URL: supabaseUrl }) }], exports: [ConfigService] })(TestConfigModule);
  Module({ imports: [TestConfigModule, AuthModule, MaternoImportacaoModule] })(TestModule);
  const app = await NestFactory.create(TestModule, { logger: false, abortOnError: false });
  t.after(() => app.close());
  const writes = [];
  let storageError = null;
  let readError = null;
  let storedRows = [];
  const ranges = [];
  app.get(MaternoImportacaoService).supabase = {
    from(table) {
      assert.equal(table, 'materno_resultados');
      return {
        async upsert(rows, options) { writes.push({ rows, options }); return { error: storageError }; },
        select() { return this; }, in() { return this; }, order() { return this; },
        async range(start, end) { ranges.push([start,end]); return { data: storedRows.slice(start,end+1), error:readError }; },
      };
    },
  };
  app.setGlobalPrefix('api');
  await app.listen(0, '127.0.0.1');
  const url = `${await app.getUrl()}/api/materno-infantil/importar`;
  const token = (role, extra = {}) => {
    const enc = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const unsigned = `${enc({ alg: 'ES256', kid: 'local-test' })}.${enc({
      sub: 'local-user', aud: 'authenticated', iss: `${supabaseUrl}/auth/v1`,
      exp: Math.floor(Date.now() / 1000) + 600, app_metadata: { role }, ...extra,
    })}`;
    return `${unsigned}.${sign('sha256', Buffer.from(unsigned), { key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
  };
  const post = async ({ jwt = token('OPERADOR'), bytes, filename = 'dados.xlsx', field = 'arquivo' } = {}) => {
    const body = new FormData();
    if (bytes) body.append(field, new Blob([bytes]), filename);
    const res = await fetch(url, { method: 'POST', body, headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} });
    return { status: res.status, body: await res.json() };
  };
  const workbook = (invalid = false) => {
    const wb = new Workbook();
    wb.addWorksheet('Referência').addRows([['codigo_indicador', 'unidade_medida'], ['MI01', '%']]);
    wb.addWorksheet('Cadastro Indicadores').addRows([
      ['periodo_referencia', 'codigo_indicador', 'tipo_atendimento', 'detalhamento', 'resultado_informado', 'numerador', 'denominador', 'justificativa_observacao', 'relatorio_fonte', 'data_do_registro', 'area_responsavel', 'situacao_do_dado'],
      [new Date('2026-10-01'), 'MI01', invalid ? '' : 'Pré-natal', 'UBS teste', 80],
      [null, 'MI01'],
    ]);
    return wb;
  };
  const valid = await workbook().xlsx.writeBuffer();
  const get = (jwt) => fetch(url.replace('/importar','/resultados'), { headers:jwt ? { Authorization:`Bearer ${jwt}` } : {} });
  await t.test('GET exige JWT e permite leitura a todos os perfis autenticados', async () => {
    for (const jwt of [null,'invalid',token('OPERADOR',{exp:1})]) assert.equal((await get(jwt)).status,401);
    for (const role of ['OPERADOR','ADMIN','GESTOR','VISUALIZADOR_UNIDADE',undefined]) {
      const res = await get(token(role));
      assert.equal(res.status,200);
      const body = await res.json();
      assert.equal(body.indicators.length,9);
      assert.ok(body.indicators.every(x=>x.latest===null));
    }
  });
  await t.test('GET pagina sem truncar e propaga falha sem fallback', async () => {
    storedRows = Array.from({length:501},(_,i)=>({periodo_referencia:'2026-08-01',codigo_indicador:'2017',tipo_atendimento:'SUS',detalhamento:'Sem detalhamento',resultado:1,numerador:1,denominador:1,atualizado_em:'2026-09-01'}));
    ranges.length=0;
    const res = await get(token('GESTOR'));
    assert.equal(res.status,200);
    assert.equal((await res.json()).indicators.find(x=>x.id==='mi37').latest.value,100);
    assert.deepEqual(ranges,[[0,499],[500,999]]);
    readError={message:'Falha simulada'};
    assert.equal((await get(token('GESTOR'))).status,500);
    readError=null; storedRows=[];
  });
  await t.test('OPERADOR importa sem x-api-key e retorna contagens', async () => {
    assert.deepEqual(await post({ bytes: valid }), { status: 201, body: { importadas: 1, ignoradas: 1 } });
    assert.equal(writes.length, 1);
    assert.equal(writes[0].rows[0].resultado, 80);
    assert.equal(writes[0].options.onConflict, 'periodo_referencia,codigo_indicador,tipo_atendimento,detalhamento');
  });
  await t.test('401 para sessão ausente, token inválido e expirado', async () => {
    for (const jwt of [null, 'invalid', token('OPERADOR', { exp: 1 })]) assert.equal((await post({ jwt, bytes: valid })).status, 401);
  });
  await t.test('403 para todos os outros perfis e role forjada em user_metadata', async () => {
    for (const role of ['ADMIN', 'GESTOR', 'VISUALIZADOR_UNIDADE', undefined]) {
      assert.equal((await post({ jwt: token(role, { user_metadata: { role: 'OPERADOR' } }), bytes: valid })).status, 403);
    }
  });
  await t.test('arquivo ausente, campo errado, extensão, conteúdo e abas inválidos: 400', async () => {
    for (const options of [{}, { bytes: valid, field: 'file' }, { bytes: valid, filename: 'dados.csv' }, { bytes: Buffer.from('invalid') }, { bytes: await new Workbook().xlsx.writeBuffer() }]) {
      assert.equal((await post(options)).status, 400);
    }
  });
  await t.test('erros por linha e nenhuma gravação após validação inválida', async () => {
    const result = await post({ bytes: await workbook(true).xlsx.writeBuffer() });
    assert.equal(result.status, 400);
    assert.deepEqual(result.body.erros, [{ linha: 2, motivo: 'tipo_atendimento vazio' }]);
    assert.equal(writes.length, 1);
  });
  await t.test('arquivo acima de 5 MiB: 413', async () => {
    assert.equal((await post({ bytes: Buffer.alloc(5 * 1024 * 1024 + 1) })).status, 413);
    assert.equal(writes.length, 1);
  });
  await t.test('falha de persistência: 500', async () => {
    storageError = { message: 'Falha simulada' };
    assert.equal((await post({ bytes: valid })).status, 500);
  });
});
