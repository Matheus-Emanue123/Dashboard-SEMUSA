import { useEffect, useMemo, useState } from "react";

import { groupByStage } from "../services/indicatorStages";

function useDebouncedValue(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debounced;
}

function useIndicatorBrowser({ indicators, stage, stages }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const debouncedQuery = useDebouncedValue(query);

  const filtered = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();

    return indicators.filter((indicator) => {
      const matchesQuery = indicator.name.toLowerCase().includes(normalized);
      const matchesStatus = status === "all" || indicator.status === status;
      const matchesStage = stage === "all" || indicator.stageId === stage;
      return matchesQuery && matchesStatus && matchesStage;
    });
  }, [indicators, debouncedQuery, status, stage]);

  const grouped = useMemo(
    () => groupByStage(filtered, stages),
    [filtered, stages],
  );

  return {
    query,
    setQuery,
    status,
    setStatus,
    filtered,
    grouped,
  };
}

export default useIndicatorBrowser;
