# Dashboard SEMUSA — Backend

API em NestJS para consulta de indicadores e importação de planilhas
materno-infantis no Supabase (Postgres gerenciado).

```
Frontend (React) → API NestJS (/api/...) → Supabase (Postgres)
```

## Setup

```bash
npm install
cp .env.example .env
# preencha SUPABASE_URL, SUPABASE_KEY e SUPABASE_SERVICE_ROLE_KEY
# (Supabase > Project Settings > API; chaves somente no backend)

npm run start:dev   # sobe em http://localhost:3000/api
```

As tabelas já existem no projeto **"DashBoard SEMUSA"** no Supabase, populadas
com os mesmos dados que hoje estão mockados em `src/data/overviewDashboard.js`.

## Endpoints (cada um = 1 tabela, sem transformação de negócio)

| Endpoint                        | Tabela Supabase       | Substitui no frontend |
|----------------------------------|------------------------|-------------------------|
| `GET /api/linhas-cuidado`        | `linhas_cuidado`       | `LINE_SUMMARY_CARDS`    |
| `GET /api/cobertura-mensal`      | `cobertura_mensal`     | `COVERAGE_SERIES`       |
| `GET /api/cobertura-linhas`      | `cobertura_linhas`     | `COVERAGE_LINES`        |
| `GET /api/indicadores-atencao`   | `indicadores_atencao`  | `ATTENTION_INDICATORS`  |
| `GET /api/status-linhas`         | `status_linhas`        | `LINE_STATUS`           |
| `GET /api/avisos-qualidade`      | `avisos_qualidade`     | `QUALITY_NOTICES`       |
| `GET /api/fontes-ativas`         | `fontes_ativas`        | `ACTIVE_SOURCES`        |

## Trocar o mock pelo fetch no frontend

Hoje cada componente importa direto de `overviewDashboard.js`, ex:

```js
import { LINE_SUMMARY_CARDS } from "../../data/overviewDashboard";
```

Passa a buscar da API (ex. com `useEffect` + `fetch`, ou React Query se
preferirem adicionar a lib):

```js
const [cards, setCards] = useState([]);

useEffect(() => {
  fetch("http://localhost:3000/api/linhas-cuidado")
    .then((res) => res.json())
    .then(setCards);
}, []);
```

O formato retornado por cada endpoint já é idêntico ao array/objeto mockado
correspondente, então o resto do componente (JSX, estilos) não muda nada.

## Próximos passos em aberto

- Trocar a `SUPABASE_KEY` de exemplo pela chave real (recomendo a
  `service_role` só no backend — nunca expor essa chave no frontend).
- Decidir se querem paginação/filtros (ex: `?linha=materno`) quando o volume
  de indicadores crescer — hoje os endpoints devolvem tudo de uma vez, o que
  é suficiente para o volume atual de dados mockados.

## Importação materno-infantil

`POST /api/materno-infantil/importar` exige JWT válido da sessão Supabase
(`Authorization: Bearer ...`) e role `OPERADOR` em `app_metadata`.
Nenhuma API key de importação é necessária. Os demais perfis, inclusive `ADMIN`,
recebem 403. Sem JWT válido, a resposta é 401.

Envie `multipart/form-data`, campo `arquivo`, com um `.xlsx` de até 5 MiB.
O navegador define o `Content-Type` e o boundary automaticamente.
A planilha deve seguir o modelo com abas `Cadastro Indicadores` e `Referência`.

- 201: `{ "importadas": 10, "ignoradas": 2 }`.
- 400: `{ "message": "..." }`; erros de linhas também incluem
  `"erros": [{ "linha": 2, "motivo": "..." }]`. Se houver erros de validação,
  nenhuma linha é gravada.
- 413: arquivo acima do limite.
- 500: falha na persistência. A gravação ocorre em lotes de 500, sem transação
  entre lotes; uma falha pode deixar lotes anteriores gravados.

No backend, configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` para a
importação, além de `SUPABASE_KEY` usada pelas consultas existentes. A chave
service role é exclusiva do servidor e nunca deve usar prefixo `VITE_`.
No frontend, mantenha `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e
`VITE_API_BASE_URL` (padrão `http://localhost:3000/api`). O botão usa o JWT da
sessão por `apiFetch`, fica disponível apenas para `OPERADOR` e recarrega
a consulta compartilhada de resultados após uma importação bem-sucedida.

Validação HTTP local, com JWT ES256 e JWKS locais e persistência simulada
(sem acesso ao Supabase real), e os testes unitários do parser da planilha:
`npm run build && node --test test/*.test.cjs`.

## Consulta dos resultados materno-infantis

`GET /api/materno-infantil/resultados` exige o JWT Supabase usado nas demais
rotas. Qualquer perfil autenticado pode consultar; `POST /importar` continua
exclusivo de `OPERADOR`. O cliente Supabase privilegiado permanece somente no
servidor. A consulta é paginada e falhas retornam 500, sem dados demonstrativos.

Contrato: `{ indicators: [{ id, code, unit, latest, monthly, quadrimester,
sources, updatedAt, parameter, status, trend }] }`.

- `latest`: último mês importado daquele código, ou `null`.
- Pontos de `monthly`/`quadrimester`: `{ period: "2026-08", label: "ago/2026",
  partial: false, value: 91.23, normal: null, cesareo: null }`.
- `value` está na unidade de apresentação: percentuais em 0–100, tempos em
  dias/minutos. Para PARTOS, `value` é `null` e `normal`/`cesareo` contêm os
  dois percentuais. Ausência de componentes calculáveis produz `null`.
- Quadrimestres: jan–abr, mai–ago, set–dez. Menos de quatro meses importados
  implica `partial: true` e rótulo `· parcial`; meses ausentes não viram zero.
- `sources` são os relatórios das linhas selecionadas; `updatedAt` é a última
  importação dessas linhas. Não representam homologação ou completude.
- Sem parâmetros canônicos para os códigos suportados, `parameter` e `trend`
  ficam `null`, `status` é `unevaluated`.

Mapeamento e regras ficam em `src/materno-importacao/materno-resultados.ts`:

| Código da planilha | ID catálogo | Consolidação |
| --- | --- | --- |
| 2017 | mi37 | soma numeradores / soma denominadores × 100 |
| 2097 | mi38 | soma dias / soma RN (média ponderada) |
| 2103 | mi35 | soma numeradores / soma denominadores × 100 |
| 2015 | mi34 | soma numeradores / soma denominadores × 100 |
| 2014 | mi36 | soma numeradores / soma denominadores × 100 |
| PORTA_MEDICO | mi32 | soma minutos / soma atendimentos |
| PA_PREPARTO | mi33 | soma minutos / soma atendimentos |
| ICSAP | mi12 | soma numeradores / soma denominadores × 100 |
| PARTOS | mi08 | contagens exclusivas normal/cesáreo / total × 100 |

Os cinco códigos numéricos usam SUS e Saúde suplementar, `Sem detalhamento`;
ICSAP usa Geral, `Sem detalhamento`. Os tempos usam exclusivamente Geral,
`Todas as classificações`. PARTOS usa as seis categorias explícitas do modelo:
SUS normal/cesáreo em alto risco/risco habitual, suplementar normal/cesáreo sem
estratificação. Totais e categorias desconhecidas não são somados. A ausência
de qualquer categoria de partos no mês impede o cálculo das duas proporções;
zero explícito continua sendo um dado válido. Componentes ausentes ou
inválidos impedem uma consolidação; não há média de resultados informados.
As mesmas regras são aplicadas às linhas do quadrimestre, antes da divisão.

`CRITERIOS_RN_RISCO`, `CRI_MENOR_5`, `CRI_6_A_9` permanecem armazenados e fora
da resposta. Não há associação por nome nem mudança no parser ou no schema.
O OpenAPI do ambiente de desenvolvimento confirmou as colunas da tabela;
a inspeção SQL de índices foi negada pela conexão MCP disponível. Nenhuma
migration foi criada. O upsert mantém a chave existente
`periodo_referencia,codigo_indicador,tipo_atendimento,detalhamento`.

No frontend, `MaternoResultsProvider` mantém a única consulta compartilhada
pela página, catálogo, ficha e evolução da Visão Geral. Após importação,
recarrega a consulta; erro de recarga remove resultados antigos e exibe erro.
A formatação está em `services/maternoResults.js`. Os seis cards priorizados
mantêm os respectivos indicadores do catálogo, atualmente sem fonte importada.
Os widgets de cobertura por etapa/UBS e status ficam indisponíveis: não há
componentes, dimensão UBS ou parâmetros que legitimem os cálculos.
