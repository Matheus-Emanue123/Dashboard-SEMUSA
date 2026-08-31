export const LINE_SUMMARY_CARDS = [
  {
    id: "materno",
    label: "Materno-Infantil",
    count: 41,
    color: "#2bbac2",
    background: "#e8f8fa",
  },
  {
    id: "cancer",
    label: "Câncer Colorretal",
    count: 21,
    color: "#1d4e8a",
    background: "#e6ecf5",
  },
  {
    id: "navegacao",
    label: "Navegação do Cuidado",
    count: 18,
    color: "#16a34a",
    background: "#e6f4eb",
  },
  {
    id: "conexao",
    label: "Conexão Colaborativa",
    count: 3,
    color: "#d97706",
    background: "#fdf3e3",
  },
  {
    id: "ods",
    label: "Ações em Saúde / ODS",
    count: null,
    color: "#6b7280",
    background: "#f0f0f0",
  },
];

export const COVERAGE_SERIES = [
  { mes: "Ago", materno: 78, cancer: 62, navegacao: 71, conexao: 55 },
  { mes: "Set", materno: 80, cancer: 58, navegacao: 74, conexao: 59 },
  { mes: "Out", materno: 76, cancer: 65, navegacao: 76, conexao: 61 },
  { mes: "Nov", materno: 82, cancer: 61, navegacao: 79, conexao: 64 },
  { mes: "Dez", materno: 85, cancer: 67, navegacao: 78, conexao: 68 },
  { mes: "Jan", materno: 83, cancer: 70, navegacao: 82, conexao: 70 },
  { mes: "Fev", materno: 87, cancer: 72, navegacao: 84, conexao: 73 },
];

export const COVERAGE_LINES = [
  { dataKey: "materno", name: "Materno-Infantil", color: "#2bbac2", gradientId: "gmat" },
  { dataKey: "cancer", name: "Câncer Colorretal", color: "#1d4e8a", gradientId: "gcan" },
  { dataKey: "navegacao", name: "Navegação do Cuidado", color: "#16a34a", gradientId: "gnav" },
];

export const STATUS_STYLES = {
  ok: { color: "#2bbac2", background: "#e8f8fa", symbol: "✓" },
  alert: { color: "#d97706", background: "#fdf3e3", symbol: "!" },
  worsening: { color: "#7c3aed", background: "#f3eeff", symbol: "↓" },
};

export const ATTENTION_INDICATORS = [
  {
    label: "Sífilis congênita em tendência de piora",
    line: "Materno-Infantil",
    status: "worsening",
  },
  {
    label: "FIT: realização 25pp abaixo da meta (34,7%)",
    line: "Câncer Colorretal",
    status: "alert",
  },
  {
    label: "Cobertura vacinal DPT: 91,2% vs meta ≥ 95%",
    line: "Materno-Infantil",
    status: "alert",
  },
  {
    label: "Abandono de tratamento crônicas: 18,4%",
    line: "Navegação do Cuidado",
    status: "worsening",
  },
  {
    label: "Tempo médio de espera especialidade: 47 dias",
    line: "Navegação do Cuidado",
    status: "alert",
  },
  {
    label: "Risco nutricional infantil em piora",
    line: "Conexão Colaborativa",
    status: "worsening",
  },
];

export const LINE_STATUS = [
  { linha: "Materno-Infantil", ok: 3, alert: 2, worsening: 1, color: "#2bbac2" },
  { linha: "Câncer Colorretal", ok: 1, alert: 3, worsening: 1, color: "#1d4e8a" },
  { linha: "Navegação do Cuidado", ok: 1, alert: 2, worsening: 2, color: "#16a34a" },
  { linha: "Conexão Colaborativa", ok: 1, alert: 1, worsening: 1, color: "#d97706" },
];

export const QUALITY_NOTICES = [
  "SIM/SINASC — atraso de 45 dias na consolidação",
  "Sistemas hospitalares — integração parcial (3/5)",
  "SISREG — 12% dos encaminhamentos sem retorno",
];

export const ACTIVE_SOURCES = [
  "e-SUS/PEC",
  "SINAN",
  "SIM/SINASC",
  "SI-PNI",
  "SIH/SUS",
  "SISREG",
  "CadÚnico",
  "SISVAN",
];
