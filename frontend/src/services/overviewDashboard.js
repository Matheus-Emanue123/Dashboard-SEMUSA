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
    count: 8,
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
  ok: {
    color: "var(--status-ok)",
    background: "var(--status-ok-bg)",
    border: "var(--status-ok-border)",
    softBorder: "var(--status-ok-soft-border)",
    symbol: "✓",
    label: "OK",
  },
  alert: {
    color: "var(--status-alert)",
    background: "var(--status-alert-bg)",
    border: "var(--status-alert-border)",
    softBorder: "var(--status-alert-soft-border)",
    symbol: "!",
    label: "Alerta",
  },
  improving: {
    color: "var(--status-improving)",
    background: "var(--status-improving-bg)",
    border: "var(--status-improving-border)",
    softBorder: "var(--status-improving-soft-border)",
    symbol: "↑",
    label: "Melhora",
  },
  stable: {
    color: "var(--status-stable)",
    background: "var(--status-stable-bg)",
    border: "var(--status-stable-border)",
    softBorder: "var(--status-stable-soft-border)",
    symbol: "=",
    label: "Estável",
  },
  worsening: {
    color: "var(--status-worsening)",
    background: "var(--status-worsening-bg)",
    border: "var(--status-worsening-border)",
    softBorder: "var(--status-worsening-soft-border)",
    symbol: "↓",
    label: "Piora",
  },
};

export const STATUS_DESCRIPTIONS = {
  ok: "Dentro do parâmetro",
  alert: "Fora do parâmetro",
  improving: "Tendência de melhora",
  worsening: "Tendência de piora",
  stable: "Estável",
};

export const LOCATION_OPTIONS = [
  "Município de Divinópolis",
  "Distrito Sanitário Norte",
  "Distrito Sanitário Sul",
  "UBS Centro",
  "UBS Bom Pastor",
  "UBS Niterói",
];

export const PAGE_META = {
  "Visão Geral": {
    title: "Visão Geral",
    subtitle: "Resumo consolidado de todas as linhas de cuidado",
  },
  "Materno-Infantil": {
    title: "Linha Materno-Infantil",
    subtitle: "41 indicadores · Gestação → Infância",
  },
  "Câncer Colorretal": {
    title: "Linha Câncer Colorretal",
    subtitle: "21 indicadores · Rastreamento → Desfechos",
  },
  "Navegação do Cuidado": {
    title: "Navegação do Cuidado",
    subtitle: "18 indicadores · Fluxo e continuidade da rede",
  },
  "Conexão Colaborativa": {
    title: "Conexão Colaborativa",
    subtitle: "3 indicadores · Programas sociais e nutrição",
  },
  ODS: {
    title: "Ações em Saúde / ODS",
    subtitle: "8 indicadores · ODS 2, 3, 10 e 17",
  },
  Catálogo: {
    title: "Catálogo de Indicadores",
    subtitle: "Catálogo das fichas oficiais · filtro por linha e situação",
  },
};

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
