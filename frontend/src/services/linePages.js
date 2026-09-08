export const MATERNO_JOURNEY = [
  {
    n: 1,
    label: "GESTAÇÃO",
    color: "#2bbac2",
    items: [
      "Início do pré-natal",
      "Número de consultas",
      "Pressão, peso e altura",
      "HIV, sífilis e hepatites",
      "Vacinação e saúde bucal",
    ],
  },
  {
    n: 2,
    label: "PARTO",
    color: "#1d8fa8",
    items: ["Tempo de espera", "Classificação de risco obstétrico", "Classificação de Robson"],
  },
  {
    n: 3,
    label: "PUERPÉRIO",
    color: "#1a7a8c",
    items: ["Consulta no puerpério", "Visita domiciliar", "Continuidade do cuidado"],
  },
  {
    n: 4,
    label: "RECÉM-NASCIDO",
    color: "#1d4e8a",
    items: ["Aleitamento na primeira hora", "Primeira consulta", "Cobertura vacinal"],
  },
  {
    n: 5,
    label: "INFÂNCIA",
    color: "#163e70",
    items: ["Mortalidade infantil", "Internações", "Acompanhamento da criança"],
  },
];

export const MATERNO_STAGE_COVERAGE = [
  { etapa: "Gestação", valor: 78 },
  { etapa: "Parto", valor: 84 },
  { etapa: "Puerpério", valor: 71 },
  { etapa: "Recém-nasc.", valor: 89 },
  { etapa: "Infância", valor: 76 },
];

export const MATERNO_UBS_COVERAGE = [
  { ubs: "UBS Centro", pn: 84, vac: 93 },
  { ubs: "UBS Bom Pastor", pn: 79, vac: 89 },
  { ubs: "UBS Niterói", pn: 72, vac: 91 },
  { ubs: "UBS Industrial", pn: 68, vac: 87 },
  { ubs: "UBS Dantas", pn: 81, vac: 95 },
];

export const CANCER_FLOW = [
  {
    label: "RASTREAMENTO",
    color: "#2bbac2",
    items: ["Pop. elegível", "Beneficiários do PBF rastreados", "Realização do FIT", "Adesão à proposta"],
  },
  {
    label: "SUSPEITA",
    color: "#1d8fa8",
    items: ["Positividade do FIT", "Encaminhamento para investigação"],
  },
  {
    label: "DIAGNÓSTICO",
    color: "#1d4e8a",
    items: ["Acesso à consulta especializada", "Colonoscopia", "Resultado da biópsia", "Consulta hospitalar"],
  },
  {
    label: "TRATAMENTO",
    color: "#16a34a",
    items: ["Início em até 60 dias", "Internações"],
  },
  {
    label: "DESFECHOS",
    color: "#163e70",
    items: ["Incidência e mortalidade", "Sobrevivência 3 e 5 anos"],
  },
];

export const CANCER_FUNNEL = [
  { etapa: "Pop. elegível (45-75a)", n: 42000 },
  { etapa: "FIT realizado", n: 14574 },
  { etapa: "FIT positivo", n: 1457 },
  { etapa: "Colonoscopia", n: 896 },
  { etapa: "Diagnóstico confirmado", n: 142 },
  { etapa: "Tratamento iniciado", n: 103 },
];

export const FUNNEL_COLORS = ["#2bbac2", "#1d8fa8", "#1d6fa8", "#1d4e8a", "#16a34a", "#163e70"];

export const NETWORK_LEVELS = [
  { nivel: "UBS / APS", consultas: 182000, encaminhamentos: 12400, color: "#16a34a" },
  { nivel: "Especialidades", consultas: 9800, encaminhamentos: 1200, color: "#2bbac2" },
  { nivel: "Hospital", consultas: 4200, encaminhamentos: 320, color: "#1d4e8a" },
  { nivel: "Urgência/Emergência", consultas: 28000, encaminhamentos: 0, color: "#d97706" },
];

export const WAIT_TIME_SERIES = [
  { mes: "Ago", espera: 39, meta: 30 },
  { mes: "Set", espera: 41, meta: 30 },
  { mes: "Out", espera: 43, meta: 30 },
  { mes: "Nov", espera: 42, meta: 30 },
  { mes: "Dez", espera: 45, meta: 30 },
  { mes: "Jan", espera: 47, meta: 30 },
];

export const ACCESS_BARS = [
  { label: "Cobertura de equipes de Saúde da Família", value: 78.6, meta: 80, color: "#16a34a" },
  { label: "Resolubilidade na atenção primária", value: 82.1, meta: 85, color: "#2bbac2" },
  { label: "Taxa de referência com retorno", value: 64.3, meta: 75, color: "#d97706" },
  { label: "Abandono de tratamento (crônicas)", value: 81.6, meta: 90, color: "#7c3aed" },
];

export const CONEXAO_KPIS = [
  { label: "Beneficiários PBF com saúde em dia", value: "89,3%", color: "#16a34a", icon: "✓" },
  { label: "Adesão ao rastreamento (PBF)", value: "41,2%", color: "#d97706", icon: "!" },
  { label: "Crianças em risco nutricional", value: "14,7%", color: "#7c3aed", icon: "↓" },
  { label: "Famílias cadastradas no CadÚnico", value: "28.432", color: "#2bbac2", icon: "=" },
];

export const CONEXAO_GROUPS = [
  { grupo: "Gestantes", cobertura: 94, meta: 100 },
  { grupo: "Crianças < 2a", cobertura: 88, meta: 100 },
  { grupo: "Crianças 2-5a", cobertura: 72, meta: 90 },
  { grupo: "Adultos c/ HAS", cobertura: 67, meta: 80 },
  { grupo: "Adultos c/ DM", cobertura: 71, meta: 80 },
];

export const CONEXAO_HISTORY = [
  { mes: "Ago", pbf: 87, sisvan: 61 },
  { mes: "Set", pbf: 88, sisvan: 63 },
  { mes: "Out", pbf: 87, sisvan: 65 },
  { mes: "Nov", pbf: 89, sisvan: 64 },
  { mes: "Dez", pbf: 88, sisvan: 67 },
  { mes: "Jan", pbf: 89, sisvan: 68 },
];

export const ODS_SCORES = [
  { ods: "ODS 2", score: 62, meta: 80 },
  { ods: "ODS 3", score: 71, meta: 80 },
  { ods: "ODS 10", score: 48, meta: 80 },
  { ods: "ODS 17", score: 44, meta: 80 },
];

export const ODS_PANELS = [
  {
    ods: "ODS 3",
    titulo: "Saúde e Bem-Estar",
    cor: "#4CAF50",
    indicadores: [
      { name: "Mortalidade prematura por DCNT", value: "342", status: "alert", trend: "↓ -12/ano", meta: "< 300" },
      { name: "Cobertura de serviços de saúde essenciais", value: "71,4%", status: "stable", trend: "↑ +1,2pp", meta: "≥ 80%" },
      { name: "Mortalidade materna", value: "38,6", status: "ok", trend: "↑ -4,1", meta: "< 50" },
    ],
  },
  {
    ods: "ODS 2",
    titulo: "Fome Zero e Agricultura",
    cor: "#FFC107",
    indicadores: [
      { name: "Prevalência de desnutrição infantil (< 5a)", value: "4,2%", status: "ok", trend: "↑ -0,3pp", meta: "< 5%" },
      { name: "Insegurança alimentar grave", value: "8,7%", status: "alert", trend: "↓ +0,9pp", meta: "< 5%" },
    ],
  },
  {
    ods: "ODS 10",
    titulo: "Redução das Desigualdades",
    cor: "#E91E63",
    indicadores: [
      { name: "Desigualdade racial em cobertura vacinal", value: "7,3pp", status: "alert", trend: "↑ -1,1pp", meta: "< 3pp" },
      { name: "Acesso equitativo à atenção especializada", value: "62,1%", status: "alert", trend: "↑ +3,2pp", meta: "≥ 75%" },
    ],
  },
  {
    ods: "ODS 17",
    titulo: "Parcerias para os Objetivos",
    cor: "#1565C0",
    indicadores: [
      { name: "Sistemas integrados em funcionamento", value: "4 de 9", status: "alert", trend: "↑ +1", meta: "9 de 9" },
    ],
  },
];

export const DIAGNOSTICO_KPIS = [
  {
    id: "cc03",
    label: "Colonoscopias Realizadas",
    value: "61,5%",
    meta: "Meta: ≥ 80%",
    status: "alert",
    trend: "↑ +8,3pp",
    source: "PEC / AAE",
    description: "Após FIT positivo ou indicação clínica",
  },
  {
    id: "cc04",
    label: "Tempo até Consulta Especializada",
    value: "24 dias",
    meta: "Meta: ≤ 30 dias",
    status: "ok",
    trend: "↓ -4 dias",
    source: "SISREG",
    description: "Encaminhamento APS até proctologia",
  },
  {
    id: "cc05",
    label: "Tempo até Laudo da Biópsia",
    value: "18 dias",
    meta: "Meta: ≤ 15 dias",
    status: "alert",
    trend: "↑ +3 dias",
    source: "Sistemas Hospitalares",
    description: "Coleta histopatológica até resultado",
  },
  {
    id: "cc06",
    label: "Consulta Hospitalar em ≤ 30 dias",
    value: "78,2%",
    meta: "Meta: ≥ 85%",
    status: "alert",
    trend: "↑ +2,5pp",
    source: "UNACOM",
    description: "Casos confirmados em centro de oncologia",
  },
];

export const DIAGNOSTICO_WAIT_TIMES = [
  { mes: "Ago/24", consulta: 34, biopsia: 22, metaConsulta: 30, metaBiopsia: 15 },
  { mes: "Set/24", consulta: 31, biopsia: 20, metaConsulta: 30, metaBiopsia: 15 },
  { mes: "Out/24", consulta: 29, biopsia: 19, metaConsulta: 30, metaBiopsia: 15 },
  { mes: "Nov/24", consulta: 28, biopsia: 17, metaConsulta: 30, metaBiopsia: 15 },
  { mes: "Dez/24", consulta: 26, biopsia: 19, metaConsulta: 30, metaBiopsia: 15 },
  { mes: "Jan/25", consulta: 24, biopsia: 18, metaConsulta: 30, metaBiopsia: 15 },
];

export const DIAGNOSTICO_PROVIDERS = [
  { unidade: "Compl. São João de Deus", realizadas: 184, pendentes: 48, taxa: 79 },
  { unidade: "CIS-URG Oeste", realizadas: 96, pendentes: 38, taxa: 71 },
  { unidade: "Hospital São Judas", realizadas: 62, pendentes: 42, taxa: 59 },
  { unidade: "Policlínica Central", realizadas: 45, pendentes: 31, taxa: 59 },
];

