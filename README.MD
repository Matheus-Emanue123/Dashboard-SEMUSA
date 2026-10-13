# Dashboard SEMUSA - Guia Básico de Execução

Este projeto implementa um dashboard de indicadores de saúde desenvolvido no contexto da disciplina **Projetos Integradores para Solução de Problemas Reais**, do CEFET-MG, em colaboração com a Secretaria Municipal de Saúde (SEMUSA) da prefeitura de Divinópolis, MG.

O sistema busca apoiar o acompanhamento de indicadores e linhas de cuidado, reduzindo trabalho manual e facilitando a análise de situação, tendência, parâmetros e qualidade dos dados.

---

## 1) Pré-requisitos

- Node.js (versão 18 ou superior recomendada) instalado;
- Git instalado, caso o projeto seja baixado de um repositório;
- Conexão com a internet para baixar as dependências do frontend e do backend;
- Configuração correta das variáveis de ambiente para conexão com o Supabase.

---

## 2) Configuração do Banco de Dados e Backend

### 2.1) Configurar o Supabase / PostgreSQL

A estrutura da base de dados está reservada na pasta `database/` para migrações e seeds. Certifique-se de ter uma instância configurada no Supabase contendo as tabelas necessárias para os indicadores de saúde.

### 2.2) Configurar e Executar o Backend (NestJS)

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie o arquivo de variáveis de ambiente `.env` a partir do modelo `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Preencha o arquivo `.env` com as credenciais da sua base de dados. O backend utiliza as seguintes variáveis:
   ```text
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_KEY=sua_chave_do_supabase
   PORT=3000
   ```
   > **Aviso:** Não versione credenciais ou chaves reais no repositório.

5. Inicie o backend em modo de desenvolvimento:
   ```bash
   npm run start:dev
   ```

---

## 3) Executar o Frontend (React / Vite)

1. Em um novo terminal, navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie a aplicação web:
   ```bash
   npm run dev
   ```

4. Abra o endereço exibido no terminal (geralmente `http://localhost:5173`) no seu navegador para acessar o dashboard.

---

## 4) Escopo do Dashboard

O dashboard está organizado em torno de linhas de cuidado e outros eixos de acompanhamento, incluindo:

- Materno-Infantil
- Câncer Colorretal
- Navegação do Cuidado
- Conexão Colaborativa
- Ações em Saúde / ODS

Entre as funcionalidades disponíveis e em desenvolvimento estão:
- Visão geral dos indicadores;
- Acompanhamento por linha de cuidado;
- Catálogo de indicadores;
- Visualização de situação, tendência e parâmetros;
- Identificação de indicadores em alerta;
- Filtros e comparações;
- Consulta às fichas técnicas dos indicadores.

---

## 5) Status e Validação dos Dados

**Status:** Em desenvolvimento.

O sistema ainda está em fase de construção e validação. Parte dos dados utilizados atualmente no frontend é demonstrativa (mocks) e não deve ser interpretada como informação oficial ou homologada pela SEMUSA enquanto os contratos e fontes de dados estiverem em evolução.

Definições, fórmulas, parâmetros, fontes, periodicidades e granularidades dos indicadores devem seguir estritamente as fichas de qualificação e as validações realizadas com a SEMUSA. Quando houver divergências ou informações ainda não definidas, elas devem ser tratadas como pontos de validação, e não preenchidas por suposição.

---

## 6) Estrutura do Repositório

```text
frontend/   # Aplicação web React, Vite, Recharts
backend/    # API desenvolvida em NestJS
database/   # Estrutura reservada para migrations e seeds
docs/       # Documentação do projeto
```

---

## 7) Problemas Comuns

### Erro: Dependências não encontradas no Frontend ou Backend
Certifique-se de executar o comando de instalação em cada pasta correspondente:
```bash
npm install
```

### Erro de conexão com o Banco de Dados
Verifique se as variáveis `SUPABASE_URL` e `SUPABASE_KEY` foram configuradas corretamente no arquivo `.env` dentro da pasta `backend`.