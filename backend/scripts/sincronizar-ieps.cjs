// Roda a coleta do IEPS Data UMA VEZ e GRAVA em materno_resultados (Supabase).
// Usa o backend/.env (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY). Não precisa de login.
// Uso (dentro de backend/):  npm run build  &&  npm run ieps:sincronizar
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { IepsDataService } = require('../dist/ieps-data/ieps-data.service');

(async () => {
  // não agenda os jobs neste processo
  process.env.IEPS_SINCRONIZACAO_ATIVA = 'false';
  process.env.VIEP_SINCRONIZACAO_ATIVA = 'false';
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const resultado = await app.get(IepsDataService).sincronizar();
    for (const i of resultado.indicadores) {
      console.log(`${i.codigo.padEnd(30)} ${i.erro ? `ERRO: ${i.erro}` : `${i.linhas} linhas gravadas`}`);
    }
    console.log(`\nTotal: ${resultado.gravadas} linhas gravadas em materno_resultados.`);
  } finally {
    await app.close();
  }
})().catch((e) => {
  console.error(`Falhou: ${e.message}`);
  process.exit(1);
});
