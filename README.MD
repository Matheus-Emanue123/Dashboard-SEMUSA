# SEMUSA — Dashboard de indicadores de saúde

Dashboard web em desenvolvimento para acompanhamento de indicadores de saúde pública
(foco inicial em **materno-infantil** e **câncer colorretal**), no contexto de trabalho
com a Prefeitura / SEMUSA.

## Status

**Em desenvolvimento** (optativa / projeto acadêmico-aplicado).

## O que o sistema pretende oferecer

- Visualização de indicadores e metas em painéis (gráficos e filtros)
- Separação por eixos temáticos (materno-infantil, câncer colorretal, etc.)
- Backend e banco preparados para ingestão periódica dos dados
- Front moderno para consulta rápida por gestores

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Front-end | React 19, Vite, Recharts |
| Back-end | Estrutura modular (em construção) |
| Dados | migrations / seeds em `database/` |

## Estrutura

```
frontend/   # SPA Vite + React
backend/    # API (scaffold)
database/   # migrations e seeds
docs/       # documentação
```

## Como rodar o front (dev)

```bash
cd frontend
npm install
npm run dev
```

## Licença

Ver [LICENSE](./LICENSE).
