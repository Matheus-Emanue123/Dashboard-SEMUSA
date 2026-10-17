import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

// lê perfis.deve_trocar_senha do próprio usuário (a RLS só deixa ler o próprio perfil)
export function useDeveTrocarSenha(userId) {
  // guarda para qual usuário o valor foi lido: ao logar, `loading` fica true até a leitura chegar
  const [estado, setEstado] = useState({ userId: null, deveTrocar: false, erro: false });

  const refetch = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('perfis')
      .select('deve_trocar_senha')
      .eq('id', userId)
      .single();

    // sem conseguir ler a flag não dá para saber se o painel pode abrir: `erro` segura a tela
    setEstado({
      userId,
      deveTrocar: !error && data?.deve_trocar_senha === true,
      erro: Boolean(error),
    });
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const loading = Boolean(userId) && estado.userId !== userId;
  return {
    deveTrocar: !loading && estado.deveTrocar,
    erro: !loading && estado.erro,
    loading,
    refetch,
  };
}
