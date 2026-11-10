// Traduz uma falha de importação da planilha materno-infantil no conteúdo do pop-up de erro.
// Recebe o erro lançado por apiFetch (status + body do backend) ou um erro local
// ({ tipo: 'arquivo' | 'tamanho' }) e devolve só dados: o componente decide como desenhar.

const ABAS_PADRAO = ['Cadastro Indicadores', 'Referência'];
const AVISO_NADA_IMPORTADO = 'Nenhum dado foi importado. Os resultados atuais continuam como estavam.';

export function describeImportError(error) {
  const status = error?.status;
  const body = error?.body ?? {};
  const tipo = error?.tipo ?? body.tipo;

  if (tipo === 'tamanho' || status === 413) {
    return {
      title: 'Arquivo grande demais',
      subtitle: AVISO_NADA_IMPORTADO,
      found: 'O arquivo passa do limite de 5 MiB.',
      fix: 'Remova abas ou linhas que não fazem parte do modelo e envie de novo.',
      canRetry: true,
    };
  }
  if (status === 401) {
    return {
      title: 'Sua sessão expirou',
      found: 'Por segurança, a sessão foi encerrada antes do envio.',
      fix: 'Entre novamente no sistema e repita a importação.',
      canRetry: false,
    };
  }
  if (status === 403) {
    return {
      title: 'Sem permissão para importar',
      found: 'Somente usuários com perfil OPERADOR ou ADMIN podem importar planilhas.',
      fix: 'Se você precisa importar, peça ao administrador para ajustar o seu perfil.',
      canRetry: false,
    };
  }
  if (status >= 500) {
    return {
      title: 'Erro no servidor',
      subtitle: 'A importação pode não ter sido concluída.',
      found: 'O servidor encontrou um problema ao gravar os dados.',
      fix: 'Consulte o responsável antes de reenviar, para não duplicar a importação.',
      canRetry: false,
    };
  }
  if (!status && tipo !== 'arquivo') {
    return {
      title: 'Sem conexão com o servidor',
      subtitle: 'Não foi possível confirmar se a importação aconteceu.',
      found: 'A planilha não chegou ao servidor, ou a resposta não voltou.',
      fix: 'Verifique sua conexão. Se o envio já tinha começado, confirme o resultado antes de reenviar.',
      canRetry: true,
    };
  }

  switch (tipo) {
    case 'arquivo':
      return {
        title: 'Arquivo não reconhecido',
        subtitle: AVISO_NADA_IMPORTADO,
        found: 'Este arquivo não é uma planilha .xlsx válida. Ele pode estar corrompido ou ter sido salvo em outro formato (.xls, .csv, .ods).',
        fix: 'Abra o arquivo no Excel e use “Salvar como” → Pasta de Trabalho do Excel (.xlsx).',
        canRetry: true,
      };
    case 'abas': {
      const esperadas = Array.isArray(body.abasEsperadas) ? body.abasEsperadas : ABAS_PADRAO;
      const ausentes = new Set(Array.isArray(body.abasAusentes) ? body.abasAusentes : esperadas);
      return {
        title: 'Planilha fora do padrão',
        subtitle: AVISO_NADA_IMPORTADO,
        found: ausentes.size > 1
          ? 'O arquivo precisa ter estas duas abas, e nenhuma foi encontrada:'
          : 'O arquivo precisa ter estas duas abas, e uma delas não foi encontrada:',
        sheets: esperadas.map(name => ({ name, ok: !ausentes.has(name) })),
        fix: 'Verifique se a aba não foi renomeada ou excluída. O nome precisa ser idêntico, inclusive com acento.',
        canRetry: true,
      };
    }
    case 'colunas': {
      const colunas = Array.isArray(body.colunasAusentes) ? body.colunasAusentes : [];
      return {
        title: 'Planilha fora do padrão',
        subtitle: AVISO_NADA_IMPORTADO,
        found: colunas.length === 1
          ? 'Falta 1 coluna obrigatória na aba'
          : `Faltam ${colunas.length} colunas obrigatórias na aba`,
        sheet: body.aba,
        missingColumns: colunas,
        fix: 'Confira se o cabeçalho tem exatamente estes nomes (sem espaços extras) e está nas 10 primeiras linhas. O caminho mais seguro é partir do modelo oficial.',
        canRetry: true,
      };
    }
    case 'cabecalho':
      return {
        title: 'Planilha fora do padrão',
        subtitle: AVISO_NADA_IMPORTADO,
        found: 'Não encontramos o cabeçalho na aba',
        sheet: body.aba,
        missingColumns: body.coluna ? [body.coluna] : [],
        fix: 'O cabeçalho precisa estar nas 10 primeiras linhas da aba e conter a coluna indicada acima.',
        canRetry: true,
      };
    case 'linhas': {
      const rows = Array.isArray(body.erros) ? body.erros : [];
      return {
        title: rows.length === 1 ? '1 linha com erro' : `${rows.length} linhas com erro`,
        subtitle: AVISO_NADA_IMPORTADO,
        found: 'A planilha está no formato certo, mas algumas linhas têm problemas. Como uma linha errada bloqueia o envio, nada foi gravado.',
        rows,
        fix: 'Corrija as linhas listadas e envie a planilha novamente.',
        canRetry: true,
      };
    }
    case 'vazia':
      return {
        title: 'Planilha sem dados',
        subtitle: AVISO_NADA_IMPORTADO,
        found: 'A aba Cadastro Indicadores não tem nenhuma linha preenchida abaixo do cabeçalho.',
        fix: 'Preencha os resultados na aba Cadastro Indicadores e envie de novo.',
        canRetry: true,
      };
    default:
      return {
        title: 'Não foi possível importar',
        subtitle: AVISO_NADA_IMPORTADO,
        found: error?.message || 'A planilha foi recusada pelo servidor.',
        fix: 'Revise a planilha e tente novamente. Se o problema continuar, consulte o responsável.',
        canRetry: true,
      };
  }
}

// Texto da lista de linhas com erro, para o botão "Copiar lista".
export function formatRowErrors(rows) {
  return rows.map(row => `Linha ${row.linha}: ${row.motivo}`).join('\n');
}
