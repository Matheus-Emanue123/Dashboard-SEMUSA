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

## Administração de usuários (somente `ADMIN`)

Exigem login e a role `ADMIN`. Toda ação grava uma linha em `auditoria_admin`
(quem fez, em quem, qual operação). Precisa da migration `005_admin_users.sql`.

| Endpoint                                | O que faz                                              |
|------------------------------------------|---------------------------------------------------------|
| `GET /api/admin/users`                   | Lista paginada (`page`, `pageSize`, `busca`, `role`)    |
| `POST /api/admin/users`                  | Cria o usuário (Auth + `perfis`), com senha temporária  |
| `PATCH /api/admin/users/:id/password`    | Redefine a senha (volta a exigir a troca no próximo login) |
| `PATCH /api/admin/users/:id/role`        | Altera papel e unidade                                  |
| `PATCH /api/admin/users/:id/status`      | Bloqueia ou reativa a conta                             |
| `POST /api/auth/trocar-senha-inicial`    | Qualquer usuário logado, só enquanto `deve_trocar_senha` for verdadeiro |

Testes: `npm test`.

**Limitação conhecida:** o Supabase deixa o próprio usuário trocar a senha direto do
navegador (`auth.updateUser`) ou pedir recuperação por e-mail. A opção "Secure password
change" do Supabase só exige reautenticação quando o login tem mais de 24h, então
**não fecha** essa brecha logo após o login. Para impedir de verdade, desabilite a
recuperação de senha por e-mail e avalie um trigger em `auth.users` que audite trocas
de senha feitas fora do backend. Hoje "só o TI troca a senha" vale na interface e na API.

**Estado da conta:** o `AccountStateGuard` consulta `perfis` a cada requisição. Conta
bloqueada recebe 401, a role usada é a do banco (rebaixamento vale na hora) e, enquanto
`deve_trocar_senha` estiver ligado, só `/auth/trocar-senha-inicial` e `/auth/me` respondem.
Por isso a migration 005 precisa estar aplicada antes de subir este backend.

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
(`Authorization: Bearer ...`) e role `OPERADOR` ou `ADMIN` em `app_metadata`.
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
sessão por `apiFetch`, fica disponível apenas para `OPERADOR` e `ADMIN` e não atualiza os
dados demonstrativos dos gráficos.

Validação HTTP local, com JWT ES256 e JWKS locais e persistência simulada
(sem acesso ao Supabase real), e os testes unitários do parser da planilha:
`npm run build && node --test test/*.test.cjs`.
