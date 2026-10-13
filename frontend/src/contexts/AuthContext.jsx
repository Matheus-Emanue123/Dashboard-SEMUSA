import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext({
  user: null,
  session: null,
  role: 'VISUALIZADOR_UNIDADE',
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('VISUALIZADOR_UNIDADE');
  const [loading, setLoading] = useState(true);

  const extractRole = (userData) => {
    if (!userData) return 'VISUALIZADOR_UNIDADE';
    return (
      userData.app_metadata?.role ||
      userData.user_metadata?.role ||
      userData.user_role ||
      'VISUALIZADOR_UNIDADE'
    );
  };

  useEffect(() => {
    // Busca a sessão ativa no carregamento
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setRole(extractRole(session?.user));
      setLoading(false);
    });

    // Escuta mudanças no estado de autenticação (login, logout, refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setRole(extractRole(session?.user));
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        role,
        token: session?.access_token || null,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
