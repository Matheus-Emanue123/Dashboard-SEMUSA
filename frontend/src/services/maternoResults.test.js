import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyMaternoResults, MATERNO_PRIORITIZED_IDS } from './maternoResults.js';

const catalog = [{id:'mi37',value:'78,4%',unit:'%',parameter:'≥ 70%',status:'ok',trend:'↑ +3,2pp',period:'Jan/2025'}, {id:'mi08',unit:'%'},{id:'mi31',value:'78,4%'}];
test('ausência/falha da API elimina valores, períodos, metas, situação e tendência demonstrativos',()=>{
  for(const response of [null,{indicators:[]}]) {
    const rows=applyMaternoResults(catalog,response);
    assert.ok(rows.every(x=>x.value==='—' && x.status==='unevaluated' && x.parameter==='Não definido' && x.trend==='—' && x.period==='Sem dados'));
    assert.ok(rows.every(x=>x.history.monthly.length===0));
  }
});
test('formata resultado real sem dupla escala ou unidade; preserva histórico e período',()=>{
  const history=[{period:'2026-08',label:'ago/2026',value:91.237}];
  const result=applyMaternoResults(catalog,{indicators:[{id:'mi37',unit:'%',latest:history[0],monthly:history,quadrimester:[],sources:['Relatório'],updatedAt:'2026-09-01'}]})[0];
  assert.equal(result.value,'91,24');assert.equal(result.unit,'%');assert.equal(result.period,'ago/2026');assert.equal(result.source,'Relatório');assert.equal(result.history.monthly,history);
});
test('PARTOS mantém ambos os percentuais e ausências explícitas',()=>{
  const result=applyMaternoResults(catalog,{indicators:[{id:'mi08',unit:'%',latest:{normal:53.142857,cesareo:46.857143,label:'ago/2026'},monthly:[],quadrimester:[]}]})[1];
  assert.equal(result.value,'Normais: 53,14% · Cesáreos: 46,86%');assert.equal(result.unit,'');
});
test('cards priorizados preservam IDs do catálogo sem mapeamento por nome',()=>{
  assert.deepEqual(MATERNO_PRIORITIZED_IDS,['mi31','mi13','mi01','mi05','mi03','mi28']);
});
