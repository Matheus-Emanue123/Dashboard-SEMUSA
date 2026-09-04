export const LINE_MATERNO = "Materno-Infantil";
export const LINE_CANCER = "Câncer Colorretal";
export const LINE_NAVEGACAO = "Navegação do Cuidado";
export const LINE_CONEXAO = "Conexão Colaborativa";
export const LINE_ODS = "Ações em Saúde / ODS";

export const MATERNO_STAGE_DEFS = [
  { id: "GESTAÇÃO", label: "Gestação", color: "#2bbac2" },
  { id: "PARTO", label: "Parto", color: "#1d8fa8" },
  { id: "PUERPÉRIO", label: "Puerpério", color: "#1a7a8c" },
  { id: "RECÉM-NASCIDO", label: "Recém-nascido", color: "#1d4e8a" },
  { id: "INFÂNCIA", label: "Infância", color: "#163e70" },
];

export const CANCER_STAGE_DEFS = [
  { id: "RASTREAMENTO", label: "Rastreamento", color: "#2bbac2" },
  { id: "SUSPEITA", label: "Suspeita", color: "#1d8fa8" },
  { id: "DIAGNÓSTICO", label: "Diagnóstico", color: "#1d4e8a" },
  { id: "TRATAMENTO", label: "Tratamento", color: "#16a34a" },
  { id: "DESFECHOS", label: "Desfechos", color: "#163e70" },
];

export const NAVEGACAO_STAGE_DEFS = [
  { id: "APS", label: "UBS / APS", color: "#16a34a" },
  { id: "ESPECIALIDADES", label: "Especialidades", color: "#2bbac2" },
  { id: "CONTINUIDADE", label: "Continuidade", color: "#7c3aed" },
];

export const CONEXAO_STAGE_DEFS = [
  { id: "PBF", label: "Bolsa Família", color: "#d97706" },
  { id: "NUTRICAO", label: "Nutrição / SISVAN", color: "#16a34a" },
];

export const ODS_STAGE_DEFS = [
  { id: "ODS 3", label: "ODS 3 · Saúde", color: "#4CAF50" },
  { id: "ODS 2", label: "ODS 2 · Fome Zero", color: "#FFC107" },
  { id: "ODS 10", label: "ODS 10 · Desigualdades", color: "#E91E63" },
  { id: "ODS 17", label: "ODS 17 · Parcerias", color: "#1565C0" },
];

const STAGE_DEFS_BY_LINE = {
  [LINE_MATERNO]: MATERNO_STAGE_DEFS,
  [LINE_CANCER]: CANCER_STAGE_DEFS,
  [LINE_NAVEGACAO]: NAVEGACAO_STAGE_DEFS,
  [LINE_CONEXAO]: CONEXAO_STAGE_DEFS,
  [LINE_ODS]: ODS_STAGE_DEFS,
};

const MATERNO_STAGE_IDS = {
  GESTAÇÃO: [
    "mi02", "mi06", "mi07", "mi13", "mi14", "mi15", "mi16",
    "mi17", "mi18", "mi19", "mi20", "mi22", "mi31",
  ],
  PARTO: ["mi08", "mi32", "mi33", "mi34", "mi36"],
  PUERPÉRIO: ["mi21", "mi23"],
  "RECÉM-NASCIDO": [
    "mi03", "mi04", "mi09", "mi10", "mi24", "mi28",
    "mi29", "mi30", "mi35", "mi37", "mi38",
  ],
  INFÂNCIA: ["mi01", "mi05", "mi11", "mi12", "mi25", "mi26", "mi27"],
};

const CANCER_STAGE_IDS = {
  RASTREAMENTO: ["cc01", "cc09"],
  SUSPEITA: ["cc02", "enc1"],
  DIAGNÓSTICO: ["cc03", "cc04", "cc05", "cc06"],
  TRATAMENTO: ["cc07", "cc08", "cc10"],
  DESFECHOS: ["cc11", "cc12", "cc13", "cc14", "cc15", "cc16"],
};

const NAVEGACAO_STAGE_IDS = {
  APS: ["nav3", "nav4"],
  ESPECIALIDADES: ["nav1", "nav2"],
  CONTINUIDADE: ["nav5"],
};

const CONEXAO_STAGE_IDS = {
  PBF: ["con1", "con2"],
  NUTRICAO: ["con3"],
};

const ODS_STAGE_IDS = {
  "ODS 3": ["ods-ODS 3-0", "ods-ODS 3-1", "ods-ODS 3-2"],
  "ODS 2": ["ods-ODS 2-0", "ods-ODS 2-1"],
  "ODS 10": ["ods-ODS 10-0", "ods-ODS 10-1"],
  "ODS 17": ["ods-ODS 17-0"],
};

function invertStageMap(groupedIds) {
  return Object.entries(groupedIds).reduce((index, [stageId, ids]) => {
    ids.forEach((id) => {
      index[id] = stageId;
    });
    return index;
  }, {});
}

const STAGE_INDEX_BY_LINE = {
  [LINE_MATERNO]: invertStageMap(MATERNO_STAGE_IDS),
  [LINE_CANCER]: invertStageMap(CANCER_STAGE_IDS),
  [LINE_NAVEGACAO]: invertStageMap(NAVEGACAO_STAGE_IDS),
  [LINE_CONEXAO]: invertStageMap(CONEXAO_STAGE_IDS),
  [LINE_ODS]: invertStageMap(ODS_STAGE_IDS),
};

export function getStageDefs(line) {
  return STAGE_DEFS_BY_LINE[line] ?? [];
}

export function decorateWithStage(indicators, line) {
  return indicators.map((indicator) => {
    const resolvedLine = line ?? indicator.line;
    const index = STAGE_INDEX_BY_LINE[resolvedLine] ?? {};
    const defs = Object.fromEntries(getStageDefs(resolvedLine).map((def) => [def.id, def]));
    const stageId = index[indicator.id] ?? "OUTROS";
    const def = defs[stageId];

    return {
      ...indicator,
      stageId,
      stageLabel: def?.label ?? "Outros",
      stageColor: def?.color ?? "#6b7280",
    };
  });
}

export function countByStage(indicators) {
  return indicators.reduce((counts, indicator) => {
    counts[indicator.stageId] = (counts[indicator.stageId] ?? 0) + 1;
    return counts;
  }, {});
}

export function groupByStage(indicators, stageDefs) {
  const groups = stageDefs
    .map((def) => ({
      ...def,
      items: indicators.filter((indicator) => indicator.stageId === def.id),
    }))
    .filter((group) => group.items.length > 0);

  const mappedIds = new Set(stageDefs.map((def) => def.id));
  const leftover = indicators.filter((indicator) => !mappedIds.has(indicator.stageId));

  if (leftover.length > 0) {
    groups.push({
      id: "OUTROS",
      label: "Outros",
      color: "#6b7280",
      items: leftover,
    });
  }

  return groups;
}

export function toggleStage(current, next) {
  return current === next ? "all" : next;
}

export const NETWORK_STAGE_BY_LEVEL = {
  "UBS / APS": "APS",
  Especialidades: "ESPECIALIDADES",
  Hospital: "HOSPITAL",
  "Urgência/Emergência": "URGENCIA",
};
