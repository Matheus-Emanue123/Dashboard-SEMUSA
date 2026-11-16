// Baixa o CSV do IEPS Data SEM gravar nada no banco e mostra os valores dos últimos anos.
// Uso (dentro de backend/):  npm run build  &&  npm run ieps:simular
const { IepsClient } = require('../dist/ieps-data/ieps.client');
const { extrairObservacoes, INDICADORES_IEPS } = require('../dist/ieps-data/indicadores-ieps');

(async () => {
  const inicio = Date.now();
  const csv = await new IepsClient().baixarCsv();
  console.log(`CSV baixado: ${(csv.length / 1e6).toFixed(1)} MB em ${((Date.now() - inicio) / 1000).toFixed(1)} s`);
  const observacoes = extrairObservacoes(csv);
  for (const ind of INDICADORES_IEPS) {
    const obs = observacoes.get(ind.codigo);
    const escala = ind.unidade === 'percentual' ? 100 : 1000;
    console.log(`\n${ind.codigo} (${obs.length} linhas)`);
    for (const local of ['Divinópolis', 'Minas Gerais', 'Brasil']) {
      const ultimos = obs.filter(o => o.detalhamento === local).slice(-3);
      const texto = ultimos.map(o => `${o.ano}: ${(o.numerador / o.denominador * escala).toFixed(2)}`).join('  ');
      console.log(`  ${local.padEnd(13)} ${texto || 'sem dados'}`);
    }
  }
})().catch((e) => {
  console.error(`Falhou: ${e.message}`);
  process.exit(1);
});
