// Roda a coleta do Power BI da VIEP UMA VEZ e GRAVA em materno_resultados (Supabase).
// Usa o backend/.env (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY). Não precisa de login.
// Uso (dentro de backend/):  npm run build  &&  npm run viep:sincronizar
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { PowerBiViepService } = require('../dist/powerbi-viep/powerbi-viep.service');

(async () => {
  process.env.VIEP_SINCRONIZACAO_ATIVA = 'false'; // não agenda o job semanal neste processo
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const resultado = await app.get(PowerBiViepService).sincronizar();
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
