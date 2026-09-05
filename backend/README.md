# Dashboard SEMUSA — Backend

API mínima em NestJS. Só consulta o Supabase (Postgres gerenciado) e devolve
o que está lá, no mesmo formato que o frontend já espera.

```
Frontend (React) → API NestJS (/api/...) → Supabase (Postgres)
```

## Setup

```bash
npm install
cp .env.example .env
# preencha SUPABASE_URL e SUPABASE_KEY (Supabase > Project Settings > API)

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
