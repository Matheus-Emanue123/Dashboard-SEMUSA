// Roda a coleta do Power BI da VIEP SEM gravar nada no banco e mostra os valores.
// Uso (dentro de backend/):  npm run build  &&  npm run viep:simular
const { INDICADORES_VIEP, PAINEIS_VIEP } = require('../dist/powerbi-viep/indicadores-viep');
const { PowerBiClient } = require('../dist/powerbi-viep/powerbi.client');
const { descartarFuturos } = require('../dist/powerbi-viep/powerbi-viep.service');
const { MAPEAMENTO_MATERNO } = require('../dist/materno-importacao/materno-resultados');

const anoInicial = Number(process.env.VIEP_ANO_INICIAL ?? 2026);
const formatar = (codigo, o) => {
  const config = MAPEAMENTO_MATERNO[codigo];
  const escala = config?.scale ?? 100;
  const valor = o.denominador === null ? o.numerador : (o.numerador / o.denominador) * escala;
  return `${o.periodo.slice(0, 7)}: ${valor.toFixed(2)} ${config?.unit ?? '%'}  (${o.numerador}${o.denominador === null ? '' : ` / ${o.denominador}`})`;
};

(async () => {
  const client = new PowerBiClient();
  const paineis = {};
  for (const [nome, p] of Object.entries(PAINEIS_VIEP)) {
    paineis[nome] = await client.modelo(p.chave);
    console.log(`${p.nome}: atualizado em ${paineis[nome].ultimaAtualizacao?.slice(0, 10) ?? '?'}`);
  }
  for (const indicador of INDICADORES_VIEP) {
    try {
      const obs = descartarFuturos(await indicador.coletar(client, paineis, anoInicial), paineis[indicador.painel].ultimaAtualizacao ?? new Date().toISOString());
      console.log(`\n${indicador.codigo} (${obs.length} períodos)`);
      for (const o of obs.slice(-3)) console.log(`  ${formatar(indicador.codigo, o)}`);
    } catch (e) {
      console.log(`\n${indicador.codigo}: ERRO ${e.message}`);
    }
  }
})();
