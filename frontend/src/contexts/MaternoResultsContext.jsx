import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../services/api';
import { MATERNO_FICHA_INDICATORS } from '../services/catalogIndicators';
import { applyMaternoResults } from '../services/maternoResults';

import { MaternoResultsContext } from '../hooks/useMaternoResults';

export function MaternoResultsProvider({ children }) {
  const { session } = useAuth();
  const [state, setState] = useState({ response: null, loading: false, error: null });
  const request = useRef({ id: 0 });
  const userId = session?.user?.id;
  const reload = useCallback(async () => {
    const current = ++request.current.id;
    if (!userId) {
      setState({ response: null, loading: false, error: null });
      return;
    }
    setState({ response: null, loading: true, error: null });
    try {
      const response = await apiFetch('/materno-infantil/resultados');
      if (current === request.current.id) setState({ response, loading: false, error: null });
    } catch {
      if (current === request.current.id) setState({ response: null, loading: false, error: 'Não foi possível carregar os resultados Materno-Infantis. Tente novamente.' });
    }
  }, [userId]);
  useEffect(() => {
    let cancelled = false;
    const tracker = request.current;
    Promise.resolve().then(() => { if (!cancelled) reload(); });
    return () => { cancelled = true; tracker.id++; };
  }, [reload]);
  const indicators = useMemo(() => applyMaternoResults(MATERNO_FICHA_INDICATORS, state.response), [state.response]);
  return <MaternoResultsContext.Provider value={{ ...state, indicators, reload }}>{children}</MaternoResultsContext.Provider>;
}
