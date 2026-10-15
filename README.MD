# Dashboard SEMUSA

Dashboard de indicadores de saúde desenvolvido no contexto da disciplina
**Projetos Integradores para Solução de Problemas Reais**, do CEFET-MG, em
colaboração com a Secretaria Municipal de Saúde (SEMUSA).

O projeto busca apoiar o acompanhamento de indicadores e linhas de cuidado,
reduzindo trabalho manual e facilitando a análise de situação, tendência,
parâmetros e qualidade dos dados.

## Status

**Em desenvolvimento.**

O sistema ainda está em fase de construção e validação. Parte dos dados
utilizados atualmente no frontend é demonstrativa e não deve ser interpretada
como informação oficial ou homologada pela SEMUSA.

## Escopo

O dashboard está sendo organizado em torno de linhas de cuidado e outros eixos
de acompanhamento, incluindo:

- Materno-Infantil
- Câncer Colorretal
- Navegação do Cuidado
- Conexão Colaborativa
- Ações em Saúde / ODS

Entre as funcionalidades em desenvolvimento estão:

- visão geral dos indicadores;
- acompanhamento por linha de cuidado;
- catálogo de indicadores;
- visualização de situação, tendência e parâmetros;
- identificação de indicadores em alerta;
- filtros e comparações;
- consulta às fichas técnicas dos indicadores.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React, Vite, Recharts |
| Backend | NestJS |
| Dados | Supabase / PostgreSQL |

A integração entre frontend, backend e base de dados ainda está em evolução.
Algumas telas utilizam mocks enquanto os contratos e fontes de dados são
validados.

## Estrutura do repositório

```text
frontend/   # aplicação web React/Vite
backend/    # API NestJS
database/   # estrutura reservada para migrations e seeds
docs/       # documentação do projeto
```

## Executando o frontend

```bash
cd frontend
npm install
npm run dev
```

## Executando o backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

O backend utiliza as seguintes variáveis de ambiente:

```text
SUPABASE_URL
SUPABASE_KEY
PORT
```

Não versione credenciais ou chaves reais no repositório.

## Validação dos dados

Definições, fórmulas, parâmetros, fontes, periodicidades e granularidades dos
indicadores devem seguir as fichas de qualificação e as validações realizadas
com a SEMUSA.

Quando houver divergências ou informações ainda não definidas, elas devem ser
tratadas como pontos de validação, e não preenchidas por suposição.
