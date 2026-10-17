# Integração Materno-Infantil — implementação e validação

## Arquitetura encontrada e solução

Base inspecionada: branch `backend`, HEAD `b5d4b77`, árvore inicialmente limpa.
As instruções AGENTS.md fornecidas na sessão, README principal e README backend
orientaram a implementação. O parser e as correções de `9846811` foram preservados.

O backend é NestJS, com guards JWT/roles globais. O módulo de importação já
possui cliente Supabase exclusivo do servidor e a rota POST restrita a OPERADOR.
A leitura foi adicionada nesse módulo, reaproveitando cliente e autenticação,
sem criar dependência, migration ou acesso privilegiado no frontend.

Foram localizadas estas fontes demonstrativas Materno:

- `services/indicators.js`: seis cards priorizados com IDs antigos;
- `services/catalogIndicators.js`: fichas e resultados do catálogo/lista;
- `services/linePages.js`: cobertura por etapa e por UBS;
- `MaternoInfantil.jsx`: distribuição fixa por status;
- `services/indicatorHistory.js`: histórico ilustrativo mi31 e mi04 usado pela
  evolução na Visão Geral;
- `IndicatorSheet.jsx`: completude, validação e correções presumidas;
- `Header/header.jsx`: período e atualização fixos;
- `AttentionList` e `LineStatusBars`: alertas e status fictícios da linha.

O plano executado foi centralizar seleção/mapeamento/agregação no backend,
compartilhar uma consulta no frontend, retirar dados demonstrativos dos
consumidores Materno e validar regras, API, build e navegador.

O novo GET `/api/materno-infantil/resultados` retorna `indicators`, cada item
com `id`, `code`, `unit`, `latest`, `monthly`, `quadrimester`, `sources`,
`updatedAt`, `parameter`, `status`, `trend`. Os pontos têm `period`, `label`,
`partial`, `value`, `normal`, `cesareo`. O contrato completo, os nove mapeamentos
e as regras estão em [backend/README.md](../backend/README.md#consulta-dos-resultados-materno-infantis).
POST `/api/materno-infantil/importar` foi preservado.

O backend combina componentes antes de dividir, inclusive por quadrimestre.
Os tempos selecionam apenas Geral / Todas as classificações. PARTOS soma apenas
as seis categorias exclusivas conhecidas e mantém ambas as proporções.
Códigos não mapeados permanecem no banco. Não há correspondência por nome.
Não são presumidos pesos, metas, situação ou tendências.

`MaternoResultsProvider` é a única fonte de estado dos resultados; o adaptador
formata valores e anexa as séries. Página, catálogo e ficha compartilham esses
objetos. A ficha aberta é resolvida pelo ID atual, evitando cópia de resultado
obsoleta. A evolução usa os pontos consolidados pelo backend para Materno e
mantém o processamento anterior das demais linhas. A recarga após POST invalida
o resultado anterior, e erros exibem estado explícito sem fallback para mocks.

Os seis cards priorizados mantêm os indicadores existentes: mi31, mi13, mi01,
mi05, mi03, mi28. Nenhum tem fonte importada nesta planilha e todos ficam sem
valor. A lista completa inclui os nove indicadores suportados com resultados.
A cobertura por etapa/UBS e a distribuição por status ficam indisponíveis por
falta de componentes, dimensão UBS e parâmetros. O seletor de local da página
Materno fica desabilitado, e o cabeçalho usa período/atualização reais.

## Schema e ambiente

Consulta real via REST/OpenAPI confirmou 286 registros e colunas de
`materno_resultados`, incluindo resultado, componentes, código, período,
atendimento, detalhamento, unidade, relatório e atualização. Os registros
mostraram SUS/suplementar nos cinco códigos numéricos, Geral para ICSAP/tempos,
e as seis categorias de partos previstas no modelo.

A conexão MCP disponível não tem permissão para consultar os índices deste
projeto. Não foi possível confirmar por SQL a definição da constraint/índice.
A chave de upsert existente foi mantida sem alterações:
`periodo_referencia,codigo_indicador,tipo_atendimento,detalhamento`.
Não foi realizado upsert de teste no banco para tentar confirmar a constraint.

## Resultados reais de agosto/2026

| Indicador | Resultado calculado | Oráculo | Divergência após arredondamento |
| --- | --- | --- | --- |
| mi37 | 91,2371134% | 91,24% | nenhuma |
| mi38 | 5,9206897 dias | 5,92 dias | nenhuma |
| mi35 | 34,4827586% | 34,48% | nenhuma |
| mi34 | 89,8517674% | 89,85% | nenhuma |
| mi36 | 89,7142857% | 89,71% | nenhuma |
| mi32 | 22 minutos | 22 minutos | nenhuma |
| mi33 | 79 minutos | 79 minutos | nenhuma |
| mi12 | 17,8010471% | 17,80% | nenhuma |
| mi08 normal | 53,1428571% | 53,14% | nenhuma |
| mi08 cesáreo | 46,8571429% | 46,86% | nenhuma |

Os oráculos não foram incluídos no código de produção.

## Validação automatizada

Executada com Node 22.23.2; o Node padrão do sistema é 12 e não atende ao stack.

- `npm --prefix backend run build`: passou.
- `node --test backend/test/*.test.cjs`: 21 testes passaram, incluindo parser,
  mapeamento, ponderação, exclusão de totais/subconjuntos, tempos, PARTOS,
  último período, componentes ausentes/zero, quadrimestres e fronteiras.
- A suíte HTTP valida JWT ausente/inválido/expirado, leitura por todos os perfis,
  paginação além de 500 linhas, falha de consulta e restrição da importação.
- `npm --prefix frontend test`: ambos os arquivos passaram (10 casos).
- `npm --prefix frontend run lint`: passou com os dois avisos preexistentes em
  AuthContext (fast refresh) e Catalogo (setState no effect).
- `npm --prefix frontend run build`: passou; permanece aviso de chunk > 500 kB.
- `git diff --check`: passou.

## Navegador automatizado: autenticação simulada e leitura real

Usado `agent-browser-start`, conforme instrução da sessão. A aplicação foi
executada com login/JWT locais de teste, guards reais do backend e leitura real
do Supabase. A persistência de importação foi interceptada apenas nesse
ambiente temporário, em memória; os arquivos desse ambiente não fazem parte
da aplicação nem do diff.

Confirmado:

- login/sessão com JWT ES256 de teste;
- página Materno com dados reais e cards sem fonte sem valores demonstrativos;
- PARTOS com dois valores na ficha e duas curvas;
- histórico mensal jan–ago/2026 e quadrimestral jan–abr / mai–ago;
- ficha com período, relatório e importação reais, sem completude presumida;
- catálogo sem o antigo 78,4% Materno;
- upload de uma planilha local passando pelo parser e gravando só em memória,
  seguido de atualização automática para set/2026, 90%, sem F5;
- novo quadrimestre set–dez/2026 identificado como parcial;
- falha de leitura controlada mostra erro e remove valores antigos, sem mocks;
- GESTOR visualiza resultados (GET 200), não recebe botão de importação e tem
  POST de importação negado (403).

## Validação manual assistida: autenticação real no Supabase

Evidências relatadas pelo usuário em 17/10/2026, após executar a validação no
próprio navegador Windows. O agente não observou diretamente essa sessão e não
recebeu senha, tokens ou cabeçalhos de autenticação. Esta evidência é distinta
dos testes automatizados e do navegador com autenticação simulada descritos acima.

A aplicação foi disponibilizada em loopback, com os módulos reais de
JWT/consulta e Supabase real. A instância temporária da API não carregava o
middleware de auditoria e bloqueava métodos diferentes de GET/OPTIONS. Essa
configuração existia somente fora do repositório, para a validação sem escritas
no banco da aplicação; não altera a configuração normal de auditoria/importação.

Resultados informados pelo usuário:

| Cenário manual com sessão real | Resultado |
| --- | --- |
| Login Supabase com perfil OPERADOR | Aprovado |
| Página Materno e leitura dos nove indicadores mapeados | Valores esperados de agosto/2026 confirmados |
| PARTOS / mi08 | 53,14% normais e 46,86% cesáreos |
| Indicadores sem registros | Sem dados, sem fallback para mocks |
| Widgets sem fonte suficiente | Mensagens de indisponibilidade |
| Histórico mensal | Aprovado |
| Histórico quadrimestral | Aprovado visualmente; detalhes abaixo |
| Atualização da página (F5) | Sessão permaneceu autenticada e resultados reais reapareceram |

Na verificação visual quadrimestral, foram relatados `jan–abr/2026: 89,66%` e
`mai–ago/2026: 89,84%` para o indicador **mi37 — Percentual de recém-nascidos
com amamentação na primeira hora de vida**, ambos apresentados como períodos
completos. Esses valores são evidência da validação manual visual. A correção
matemática da agregação pelos componentes é coberta separadamente pelos testes
automatizados; a validação manual não constitui um recálculo independente.

O usuário confirmou que não realizou nova importação nessa validação.
Não foram informadas divergências em relação aos oráculos de agosto/2026.

## Cenários não exercitados manualmente com sessão real

- Nova importação e recarga automática sem F5: verificadas no navegador de teste
  com persistência em memória e nos testes HTTP; não houve nova gravação real.
- Quadrimestre parcial: verificado no navegador de teste e em testes unitários;
  na validação manual foram observados somente quadrimestres completos.
- Falha da API e ausência de fallback: falha provocada no ambiente isolado e
  coberta por testes; não foi provocada manualmente com a sessão Supabase real.
- Perfil autenticado diferente de OPERADOR: leitura permitida e importação
  negada foram verificadas com JWTs locais nos testes HTTP e no navegador de
  teste (GESTOR); não foi usada uma segunda conta Supabase na validação manual.
- Sessão expirada/inválida: coberta na suíte HTTP com JWTs locais; não exercitada
  manualmente com a conta real. F5 confirmou persistência da sessão, sem provar
  por si só renovação após expiração do token.

Os testes/builds/lint descritos acima foram executados durante a implementação.
Nesta atualização documental foi executado `git diff --check` e revisado o
estado Git; as suítes não foram repetidas porque não houve mudança de código.

## Limitações e riscos residuais

A definição SQL do índice/constraint não pôde ser inspecionada. A leitura não
exigiu mudança de schema. A consulta de todo o histórico é paginada, mas a
consolidação ocorre em memória no backend; históricos muito maiores poderão
exigir otimização futura. As categorias reconhecidas são intencionalmente
explícitas: novas categorias do modelo exigem revisão semântica, não inferência.

A importação existente continua com lotes sem transação entre lotes, conforme
README anterior. Não foi alterada. Não foram alteradas as páginas Câncer,
Navegação, Conexão ou ODS. Os títulos existentes que anunciam 41 indicadores
foram preservados; o catálogo atual contém 38 fichas Materno.

Nenhuma dependência foi adicionada. Não houve commit, push, merge ou migration.

## Arquivos alterados e estado Git

- Backend: controller/service existentes, nova regra `materno-resultados.ts`,
  suíte HTTP, nova suíte de agregações e README com contrato.
- Frontend: provider/hook compartilhados, adaptador e testes, App, cabeçalho,
  ficha, badge neutro, página Materno, catálogo e consumidores Materno da
  Visão Geral (evolução, alertas, status); script de testes no package.json.
- Documentação: este relatório. Nenhuma alteração em parser, modelo XLSX,
  migrations, dependências ou arquivos de credenciais.

Estado ao concluir a revisão (sem staging/commit):

```text
 M backend/README.md
 M backend/src/materno-importacao/materno-importacao.controller.ts
 M backend/src/materno-importacao/materno-importacao.service.ts
 M backend/test/materno-importacao.test.cjs
 M frontend/package.json
 M frontend/src/App.jsx
 M frontend/src/components/Header/header.jsx
 M frontend/src/components/IndicatorSheet/IndicatorSheet.jsx
 M frontend/src/components/StatusBadge/StatusBadge.jsx
 M frontend/src/pages/Catalogo/Catalogo.jsx
 M frontend/src/pages/Dashboard/AttentionList.jsx
 M frontend/src/pages/Dashboard/CoverageChart.jsx
 M frontend/src/pages/Dashboard/LineStatusBars.jsx
 M frontend/src/pages/MaternoInfantil/MaternoInfantil.jsx
?? backend/src/materno-importacao/materno-resultados.ts
?? backend/test/materno-resultados.test.cjs
?? docs/materno-resultados-validacao.md
?? frontend/src/contexts/MaternoResultsContext.jsx
?? frontend/src/hooks/useMaternoResults.js
?? frontend/src/services/maternoResults.js
?? frontend/src/services/maternoResults.test.js
```
