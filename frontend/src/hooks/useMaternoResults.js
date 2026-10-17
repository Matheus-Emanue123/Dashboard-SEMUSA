import { createContext, useContext } from 'react';

export const MaternoResultsContext = createContext(null);
export const useMaternoResults = () => useContext(MaternoResultsContext);
