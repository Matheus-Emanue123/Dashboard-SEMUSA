# Estudo e Guia de Segurança: OWASP Top 10 aplicado ao Dashboard SEMUSA

Este documento apresenta a análise das vulnerabilidades descritas no **OWASP Top 10 (2021)** contextualizadas para o desenvolvimento do **Dashboard SEMUSA** (Secretaria Municipal de Saúde), estabelecendo diretrizes técnicas de segurança, conformidade com a LGPD e boas práticas para o time de desenvolvimento.

---

## Sumário
1. [Contexto de Segurança da SEMUSA](#contexto-de-segurança-da-semusa)
2. [Análise detalhada do OWASP Top 10](#análise-detalhada-do-owasp-top-10)
   - [A01:2021 – Broken Access Control (Quebra de Controle de Acesso)](#a012021--broken-access-control)
   - [A02:2021 – Cryptographic Failures (Falhas Criptográficas)](#a022021--cryptographic-failures)
   - [A03:2021 – Injection (Injeção)](#a032021--injection)
   - [A04:2021 – Insecure Design (Design Inseguro)](#a042021--insecure-design)
   - [A05:2021 – Security Misconfiguration (Configuração Incorreta de Segurança)](#a052021--security-misconfiguration)
   - [A06:2021 – Vulnerable and Outdated Components (Componentes Vulneráveis e Desatualizados)](#a062021--vulnerable-and-outdated-components)
   - [A07:2021 – Identification and Authentication Failures (Falhas de Identificação e Autenticação)](#a072021--identification-and-authentication-failures)
   - [A08:2021 – Software and Data Integrity Failures (Falhas de Integridade de Software e Dados)](#a082021--software-and-data-integrity-failures)
   - [A09:2021 – Security Logging and Monitoring Failures (Falhas em Logs e Monitoramento)](#a092021--security-logging-and-monitoring-failures)
   - [A10:2021 – Server-Side Request Forgery (SSRF)](#a102021--server-side-request-forgery-ssrf)
3. [Alinhamento com a LGPD na Saúde Pública](#alinhamento-com-a-lgpd-na-saúde-pública)
4. [Checklist Prático para os Desenvolvedores](#checklist-prático-para-os-desenvolvedores)

---

## Contexto de Segurança da SEMUSA

O **Dashboard SEMUSA** manipula informações de saúde coletiva, incluindo indicadores materno-infantis, triagem de câncer colorretal, vigilância epidemiológica e métricas hospitalares. 

Por lidar com dados de saúde (classificados como **dados sensíveis** pela LGPD), a aplicação requer uma postura de segurança rigorosa baseada no princípio de **Defense in Depth** (Defesa em Profundidade) e **Security by Design**.

---

## Análise detalhada do OWASP Top 10

### A01:2021 – Broken Access Control
> **Risco:** Falhas onde usuários autenticados conseguem acessar recursos, indicadores restritos ou registros que deveriam ser acessíveis apenas a administradores ou perfis específicos.

#### Impacto na SEMUSA:
- Visualização não autorizada de indicadores clínicos ou relatórios de auditoria interna por usuários com perfil apenas de consulta.
- IDOR (*Insecure Direct Object References*) permitindo acesso a dados de outras UBS/unidades apenas alterando parâmetros em rotas da API (ex.: `/api/indicadores/unidade/123`).

#### Diretrizes de Mitigação:
- **Princípio do Menor Privilégio:** Todo usuário deve ter acesso estritamente restrito ao seu escopo de atuação.
- **Validação no Backend:** O frontend ocultar botões ou menus **não** é segurança. Toda requisição à API deve validar a sessão e permissão no servidor.
- **Row-Level Security (RLS):** Utilizar políticas de RLS no PostgreSQL/Supabase para garantir que usuários acessem apenas dados autorizados.
- **Deny by Default:** Todas as rotas e recursos devem ser bloqueados por padrão, exigindo declaração explícita de acesso.

---

### A02:2021 – Cryptographic Failures
> **Risco:** Exposição de dados sensíveis ou senhas devido à ausência ou fragilidade de mecanismos de criptografia em trânsito e em repouso.

#### Impacto na SEMUSA:
- Vazamento de credenciais de acesso ao banco municipal ou chaves de API do Supabase.
- Interceptação de dados em trânsito com métricas e identificadores de pacientes.

#### Diretrizes de Mitigação:
- **TLS/HTTPS Obrigatório:** Todo o tráfego HTTP deve ser redirecionado para HTTPS com cifras modernas (TLS 1.2+).
- **Habilitação de HSTS:** Utilizar o header `Strict-Transport-Security`.
- **Criptografia de Senhas:** Usar funções de derivação de chave seguras como **Argon2id** ou **bcrypt** com fator de custo adequado.
- **Proteção de Segredos:** Nunca comitar senhas, tokens ou certificados no repositório Git. Utilizar variáveis de ambiente gerenciadas via `.env` protegido.

---

### A03:2021 – Injection
> **Risco:** Dados fornecidos pelo usuário enviados diretamente para interpretadores (SQL, NoSQL, OS, LDAP) sem sanitização ou parametrização.

#### Impacto na SEMUSA:
- SQL Injection em filtros de pesquisa de indicadores, permitindo extração em massa de tabelas ou alteração de dados.

#### Diretrizes de Mitigação:
- **Queries Parametrizadas:** Utilizar sempre Prepared Statements e ORMs/Query Builders seguros (Prisma, TypeORM, Drizzle, SQLAlchemy, etc.).
- **Validação de Tipos e Esquemas:** Utilizar bibliotecas de validação rigorosa no backend (como **Zod**, **Joi** ou **Pydantic**) para sanitizar entradas antes do processamento.
- **Evitar concatenação de queries:** Jamais montar consultas SQL via concatenação direta de strings.

---

### A04:2021 – Insecure Design
> **Risco:** Falhas estruturais na concepção do sistema e ausência de modelagem de ameaças antes da codificação.

#### Impacto na SEMUSA:
- Falta de limites de taxa (*Rate Limiting*) permitindo scraping de dados ou ataques de negação de serviço em consultas pesadas de relatórios.
- Ausência de fluxo de recuperação de conta seguro.

#### Diretrizes de Mitigação:
- Implementar **Rate Limiting** em endpoints sensíveis e consultas pesadas de agregações de dados.
- Realizar revisão de segurança nos diagramas de arquitetura e fluxos de dados do sistema.
- Segregar o ambiente de desenvolvimento, homologação e produção com bases de dados distintas (usando dados mockados nos testes).

---

### A05:2021 – Security Misconfiguration
> **Risco:** Configurações padrão inseguras, permissões excessivas, portas desnecessárias abertas ou mensagens de erro detalhadas expondo detalhes do servidor.

#### Impacto na SEMUSA:
- Mensagens de erro com stack traces completos ou esquemas de banco vazando no payload da resposta HTTP.
- CORS excessivamente permissivo (`Access-Control-Allow-Origin: *`) permitindo que scripts de terceiros façam requisições autenticadas.
- Manutenção de credenciais padrão do Supabase ou PostgreSQL.

#### Diretrizes de Mitigação:
- Configurar headers de segurança no backend com middleware **Helmet** (ou equivalente):
  - `Content-Security-Policy` (CSP)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- Configurar CORS restrito aos domínios autorizados do frontend.
- Tratar erros globalmente no backend para retornar mensagens amigáveis sem vazar detalhes internos da infraestrutura.

---

### A06:2021 – Vulnerable and Outdated Components
> **Risco:** Uso de pacotes, bibliotecas ou frameworks desatualizados que contenham vulnerabilidades conhecidas (CVEs).

#### Impacto na SEMUSA:
- Comprometimento de bibliotecas frontend ou dependências do Node.js/Python com vulnerabilidades de execução remota de código ou XSS.

#### Diretrizes de Mitigação:
- Executar auditorias contínuas de dependências:
  ```bash
  npm audit
  # ou para python:
  pip-audit
  ```
- Manter arquivos de lock (`package-lock.json`, `poetry.lock` ou `Pipfile.lock`) versionados para garantir integridade.
- Habilitar o **Dependabot** e alertas de segurança do GitHub no repositório.
- Remover dependências não utilizadas ou abandonadas.

---

### A07:2021 – Identification and Authentication Failures
> **Risco:** Fragilidades no processo de autenticação, gerenciamento de sessões ou armazenamento de tokens.

#### Impacto na SEMUSA:
- Sessões que não expiram, permitindo acesso indevido em computadores compartilhados de unidades de saúde.
- Exposição de tokens JWT no `localStorage` suscetíveis a ataques de XSS.

#### Diretrizes de Mitigação:
- Armazenar tokens de autenticação em cookies `httpOnly`, `Secure` e com flag `SameSite=Strict` ou `Lax`.
- Implementar expiração curta de tokens de acesso (*access tokens*) combinados com *refresh tokens* rotacionados.
- Implementar bloqueio temporário ou captcha após tentativas consecutivas de login malsucedidas.
- Forçar políticas de senhas fortes.

---

### A08:2021 – Software and Data Integrity Failures
> **Risco:** Código e pipelines que não protegem contra violações de integridade ao carregar pacotes ou processar dados serializados.

#### Impacto na SEMUSA:
- Importação de dados externos (ex: e-SUS, SINAN) sem validação de esquema, corrompendo agregações estatísticas.
- Execução de scripts externos não confiáveis via CDN.

#### Diretrizes de Mitigação:
- Validar a integridade de dados e schemas em todas as rotas de ingestão e upload.
- Usar **Subresource Integrity (SRI)** se houver dependências de CDNs públicas.
- Proteger os fluxos de CI/CD garantindo revisões via Pull Requests e branch protection.

---

### A09:2021 – Security Logging and Monitoring Failures
> **Risco:** Ausência de registros de auditoria e monitoramento, impedindo a detecção precoce de incidentes e investigações forenses.

#### Impacto na SEMUSA:
- Impossibilidade de rastrear acessos a relatórios sigilosos ou tentativas repetidas de invasão.
- Não conformidade com exigências de auditoria pública e LGPD.

#### Diretrizes de Mitigação:
- Registrar eventos críticos de segurança:
  - Tentativas de login falhas e bem-sucedidas.
  - Alterações de permissões e perfis de usuário.
  - Exportação de dados e relatórios.
  - Erros de autorização (tentativas de acesso negado).
- **Importante:** Nunca registrar senhas, tokens ou dados pessoais sensíveis nos logs.
- Utilizar formato de log estruturado (JSON) com biblioteca apropriada (Pino, Winston, etc.).

---

### A10:2021 – Server-Side Request Forgery (SSRF)
> **Risco:** O servidor web busca um recurso remoto especificado pelo usuário sem validar a URL de destino.

#### Impacto na SEMUSA:
- Usuário forçando o backend a requisitar serviços internos da rede municipal ou metadados de provedores cloud.

#### Diretrizes de Mitigação:
- Se houver integração com endpoints externos informados pelo usuário, validar estritamente contra uma **whitelist** de domínios/IPs permitidos.
- Desabilitar redirecionamentos automáticos em clientes HTTP no backend.
- Isolar a camada de rede do backend para impedir chamadas diretas a metadados da nuvem (`169.254.169.254`).

---

## Alinhamento com a LGPD na Saúde Pública

1. **Dados Agregados vs. Identificáveis:** O dashboard deve priorizar a exibição de indicadores consolidados e anonimizados, reduzindo ao máximo a exibição direta de dados pessoais identificáveis (como CPF, Cartão SUS e nome completo).
2. **Minimização de Dados:** Coletar e processar apenas os dados estritamente necessários para o cálculo dos indicadores de saúde.
3. **Rastreabilidade:** Manter trilha de auditoria para garantir a prestação de contas sobre quem visualizou ou exportou relatórios.

---

## Checklist Prático para os Desenvolvedores

- [ ] **Variáveis e Segredos:** Nenhum arquivo `.env` ou credencial real versionada no Git.
- [ ] **Validação:** Todas as entradas de dados validadas no backend com schemas estritos.
- [ ] **Controle de Acesso:** Permissões verificadas no servidor para cada endpoint sensível.
- [ ] **Headers de Segurança:** Middleware `helmet` e CORS configurados no backend.
- [ ] **Autenticação Segura:** Senhas com hash forte e cookies `httpOnly` para gerenciamento de sessão.
- [ ] **Auditoria de Pacotes:** `npm audit` executado regularmente no frontend e backend.
- [ ] **Logs de Auditoria:** Eventos críticos de segurança registrados sem expor dados sensíveis.
- [ ] **RLS no Banco:** Políticas de segurança ativadas nas tabelas do banco de dados/Supabase.
