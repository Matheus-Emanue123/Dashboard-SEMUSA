import { CONEXAO_INDICATORS, NAVEGACAO_INDICATORS } from "./indicators";
import { ODS_PANELS } from "./linePages";

function ficha(id, name, line, extra = {}) {
  return {
    id,
    name,
    value: extra.value ?? "—",
    unit: extra.unit ?? "",
    parameter: extra.parameter ?? "A definir",
    status: extra.status ?? "stable",
    trend: extra.trend ?? "—",
    period: extra.period ?? "—",
    source: extra.source ?? "Ficha de qualificação",
    formula: extra.formula ?? "Conforme ficha de qualificação do indicador.",
    definition: extra.definition ?? `Indicador oficial da linha ${line}.`,
    frequency: extra.frequency ?? "A definir",
    limitations: extra.limitations ?? "Valores de painel ilustrativos até o mock da base.",
    line,
  };
}

const MATERNO = "Materno-Infantil";
const CANCER = "Câncer Colorretal";
const ODS = "Ações em Saúde / ODS";

export const MATERNO_FICHA_INDICATORS = [
  ficha("mi01", "Proporção de crianças com vacinas registradas com todas as doses recomendadas", MATERNO, {
    value: "91,2%", unit: "%", parameter: "≥ 95%", status: "alert", trend: "↓ -1,8pp", period: "Dez/2024",
    source: "SI-PNI / SIPNI", frequency: "Quadrimestral",
  }),
  ficha("mi02", "Taxa de incidência de sífilis gestacional", MATERNO, {
    unit: "por 1.000 NV", parameter: "A definir", frequency: "Anual", source: "SINAN / SINASC",
  }),
  ficha("mi03", "Taxa de incidência de sífilis congênita", MATERNO, {
    value: "4,1", unit: "por 1.000 NV", parameter: "< 0,5", status: "worsening", trend: "↓ +0,6",
    period: "Dez/2024", source: "SINAN", frequency: "Anual",
  }),
  ficha("mi04", "Número de casos novos de AIDS em menores de 1 ano", MATERNO, { unit: "casos", frequency: "Anual", source: "SINAN" }),
  ficha("mi05", "Taxa de mortalidade infantil (TMI)", MATERNO, {
    value: "8,3", unit: "por 1.000 NV", parameter: "< 10", status: "ok", trend: "↑ -0,7",
    period: "2024", source: "SIM / SINASC", frequency: "Anual",
  }),
  ficha("mi06", "Razão de mortalidade materna (RMM)", MATERNO, { unit: "por 100 mil NV", frequency: "Anual", source: "SIM / SINASC" }),
  ficha("mi07", "Proporção de gravidez na adolescência", MATERNO, { unit: "%", frequency: "Anual", source: "SINASC" }),
  ficha("mi08", "Proporção de partos normais e cesáreos", MATERNO, { unit: "%", frequency: "Anual", source: "SINASC" }),
  ficha("mi09", "Proporção de baixo peso ao nascer", MATERNO, { unit: "%", frequency: "Anual", source: "SINASC" }),
  ficha("mi10", "Taxa de prematuridade", MATERNO, { unit: "%", frequency: "Anual", source: "SINASC" }),
  ficha("mi11", "Proporção de crianças com 1 ou mais internações no último ano", MATERNO, { unit: "%", source: "SIH/SUS" }),
  ficha("mi12", "Percentual de internações por condições sensíveis à APS (ICSAP)", MATERNO, { unit: "%", source: "SIH/SUS" }),
  ficha("mi13", "Proporção de gestantes com pelo menos 7 consultas de pré-natal", MATERNO, {
    value: "5,2", unit: "consultas", parameter: "≥ 6", status: "alert", trend: "↔ -0,1",
    period: "Jan/2025", source: "e-SUS / PEC", frequency: "Mensal",
  }),
  ficha("mi14", "Proporção de gestantes com pelo menos 7 registros de pressão arterial", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi15", "Proporção de gestantes com pelo menos 7 registros de peso e altura", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi16", "Proporção de gestantes com dois testes de HIV e sífilis no pré-natal", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi17", "Proporção de gestantes com testes de sífilis, HIV e hepatites B e C no 1º trimestre", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi18", "Proporção de gestantes com testes de sífilis e HIV no 3º trimestre", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi19", "Proporção de gestantes com pelo menos 1 atividade em saúde bucal", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi20", "Proporção de gestantes com pelo menos 3 visitas domiciliares de ACS após o pré-natal", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi21", "Proporção de pelo menos 1 consulta no puerpério por médico ou enfermeiro", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi22", "Proporção de gestantes com vacina dTpa a partir da 20ª semana", MATERNO, { unit: "%", source: "SI-PNI" }),
  ficha("mi23", "Proporção de pelo menos 1 visita de ACS no puerpério", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi24", "Proporção de crianças com primeira consulta até 30 dias de vida", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi25", "Proporção de crianças com pelo menos 9 consultas até os 2 anos", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi26", "Proporção de pessoas avaliadas sobre insegurança alimentar", MATERNO, { unit: "%", source: "SISVAN" }),
  ficha("mi27", "Proporção de preenchimento do formulário de marcadores de consumo alimentar", MATERNO, { unit: "%", source: "SISVAN" }),
  ficha("mi28", "Proporção de crianças com aleitamento materno exclusivo", MATERNO, {
    value: "43,7%", unit: "%", parameter: "≥ 50%", status: "alert", trend: "↑ +2,1pp",
    period: "Dez/2024", source: "e-SUS / PEC", frequency: "Semestral",
  }),
  ficha("mi29", "Proporção de pelo menos 2 visitas ACS/TACS (30 dias e 6 meses de vida)", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi30", "Proporção de visitas do ACS entre o 2º e o 6º mês de vida", MATERNO, { unit: "%", source: "e-SUS / PEC" }),
  ficha("mi31", "Proporção de consultas entre a 1ª e a 12ª semana de gestação", MATERNO, {
    value: "78,4%", unit: "%", parameter: "≥ 70%", status: "ok", trend: "↑ +3,2pp",
    period: "Jan/2025", source: "e-SUS / PEC", frequency: "Mensal",
  }),
  ficha("mi32", "Tempo de espera porta-médico hospitalar", MATERNO, { unit: "minutos", source: "Sistemas hospitalares" }),
  ficha("mi33", "Tempo de espera do pronto atendimento ao pré-parto hospitalar", MATERNO, { unit: "minutos", source: "Sistemas hospitalares" }),
  ficha("mi34", "Taxa de aplicação do instrumento ACCR", MATERNO, { unit: "%", source: "Maternidade CSSJD" }),
  ficha("mi35", "Proporção de recém-nascidos de risco encaminhados ao PIPA", MATERNO, { unit: "%", source: "Maternidade CSSJD" }),
  ficha("mi36", "Taxa de aplicação da classificação de Robson", MATERNO, { unit: "%", source: "Maternidade CSSJD" }),
  ficha("mi37", "Percentual de recém-nascidos com amamentação na primeira hora de vida", MATERNO, { unit: "%", source: "Maternidade CSSJD" }),
  ficha("mi38", "Tempo de internação do RN de risco", MATERNO, { unit: "dias", source: "Maternidade CSSJD" }),
];

export const CANCER_FICHA_INDICATORS = [
  ficha("cc01", "Proporção de beneficiários do Bolsa Família rastreados na faixa etária de rastreamento", CANCER, {
    unit: "%", parameter: "> 75%", frequency: "Semestral", source: "e-SUS / PEC",
  }),
  ficha("cc02", "Proporção de teste imunohistoquímico fecal (FIT) positivos", CANCER, {
    value: "34,7%", unit: "%", parameter: "≥ 60%", status: "alert", trend: "↑ +5,1pp",
    period: "Jan/2025", source: "e-SUS / PEC", frequency: "Anual",
  }),
  ficha("cc03", "Proporção de colonoscopias realizadas", CANCER, {
    value: "61,5%", unit: "%", parameter: "≥ 80%", status: "alert", trend: "↑ +8,3pp",
    period: "Dez/2024", source: "PEC / AAE", frequency: "Anual",
  }),
  ficha("cc04", "Tempo médio estimado para acesso à consulta especializada", CANCER, {
    unit: "dias", frequency: "Anual", source: "SISREG",
  }),
  ficha("cc05", "Tempo médio estimado para resultado da biópsia", CANCER, { unit: "dias", source: "Sistemas hospitalares" }),
  ficha("cc06", "Proporção de pessoas com consulta no hospital do câncer em até 30 dias após suspeita", CANCER, { unit: "%", source: "UNACOM" }),
  ficha("cc07", "Proporção de pessoas com tratamento iniciado em até 60 dias após diagnóstico", CANCER, {
    value: "72,3%", unit: "%", parameter: "≥ 80%", status: "alert", trend: "↑ +4,1pp",
    period: "Dez/2024", source: "SIH/SUS + Hospital", frequency: "Semestral",
  }),
  ficha("cc08", "Incidência de pessoas internadas durante o tratamento", CANCER, { unit: "casos", source: "UNACOM" }),
  ficha("cc09", "Proporção de preenchimento do formulário de marcadores de consumo alimentar", CANCER, { unit: "%", source: "SISVAN" }),
  ficha("cc10", "Proporção de pessoas com estomia de eliminação por CCR cadastradas no serviço", CANCER, { unit: "%", source: "SASPO II" }),
  ficha("cc11", "Proporção de diagnósticos de câncer colorretal (CCR)", CANCER, { unit: "%", source: "SEMUSA" }),
  ficha("cc12", "Taxa de mortalidade específica por câncer colorretal", CANCER, { unit: "por 100 mil", source: "SIM" }),
  ficha("cc13", "Taxa de incidência de câncer colorretal", CANCER, { unit: "por 100 mil", source: "RHC / SIM" }),
  ficha("cc14", "Anos potenciais de vida perdidos (APVP) por câncer colorretal", CANCER, { unit: "anos", source: "SIM" }),
  ficha("cc15", "Taxa de sobrevivência de pessoas com CCR após 3 anos de diagnóstico", CANCER, {
    value: "67,2%", unit: "%", parameter: "≥ 70%", status: "alert", trend: "↑ +1,4pp",
    period: "2022-2024", source: "SIH/SUS + RHC", frequency: "Anual",
  }),
  ficha("cc16", "Taxa de sobrevivência de pessoas com CCR após 5 anos de diagnóstico", CANCER, { unit: "%", source: "SIH/SUS + RHC" }),
];

export const ODS_CATALOG_INDICATORS = ODS_PANELS.flatMap((panel) =>
  panel.indicadores.map((item, index) =>
    ficha(
      `ods-${panel.ods}-${index}`,
      `${panel.ods} — ${item.name}`,
      ODS,
      {
        value: item.value,
        status: item.status,
        trend: item.trend,
        parameter: item.meta,
        source: "Layout ilustrativo ODS",
        frequency: "A definir",
      },
    ),
  ),
);

export const CATALOG_GROUPS = [
  { id: "all", label: "Todos" },
  { id: MATERNO, label: "Materno-Infantil" },
  { id: CANCER, label: "Câncer Colorretal" },
  { id: "Navegação do Cuidado", label: "Navegação" },
  { id: "Conexão Colaborativa", label: "Conexão" },
  { id: ODS, label: "ODS" },
];

export const CATALOG_INDICATORS = [
  ...MATERNO_FICHA_INDICATORS,
  ...CANCER_FICHA_INDICATORS,
  ...NAVEGACAO_INDICATORS,
  ...CONEXAO_INDICATORS,
  ...ODS_CATALOG_INDICATORS,
];
