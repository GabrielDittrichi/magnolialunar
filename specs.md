# NoarEcom — Especificação Técnica

## Visão Geral
- Aplicação web em Next.js (App Router) para apresentação e gestão de terapeutas e massagens.
- Arquitetura Híbrida de Dados:
  - Primário: Banco de dados MySQL (hospedado remotamente).
  - Fallback: Arquivos JSON locais (`src/data`) utilizados automaticamente em caso de indisponibilidade do banco.
- Upload de imagens integrado ao Cloudflare R2 (compatível com S3).
- Interface pública com páginas de catálogo e detalhes; interface administrativa com CRUD e upload.

## Stack e Dependências
- Framework: Next.js 16.1.3 (Turbopack, App Router, Server/Client Components).
- Linguagem: TypeScript 5, React 19.
- Banco de Dados: MySQL (driver `mysql2`).
- Estilo: Tailwind CSS 4, tailwindcss-animate, styled-components (uso pontual).
- Animações: framer-motion.
- Imagens: next/image com remotePatterns para r2.dev e images.unsplash.com.
- Upload R2: @aws-sdk/client-s3.
- Outros: sharp (otimização), slugify (normalização de URLs).

## Ambiente e Variáveis
- R2_ACCOUNT_ID
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY
- R2_BUCKET_NAME
- R2_PUBLIC_URL
- MYSQL_HOST
- MYSQL_USER
- MYSQL_PASSWORD
- MYSQL_DATABASE
- NEXT_PUBLIC_BASE_URL (opcional; padrão http://localhost:3000 em SSR)

## Estrutura de Diretórios
- web/src/app
  - (site)/admin: páginas administrativas
  - (site)/massagens: catálogo e detalhes
  - (site)/terapeutas: catálogo e detalhes
  - (site)/sobre: página institucional
  - api: rotas internas (CRUD e upload)
- web/src/lib:
  - db.ts: Cliente MySQL com pool de conexões e lógica de fallback.
- web/src/data: armazenamento JSON de backup (therapists.json, massages.json)
- specs.md: este documento

## Modelos de Dados (MySQL & JSON)
O esquema é criado automaticamente na inicialização (`CREATE TABLE IF NOT EXISTS`).

### Tabela: `therapists`
- id: varchar(36) (UUID)
- name: varchar(255)
- slug: varchar(255) (Unique)
- specialties: json (Array de strings)
- image: text (URL R2)
- bio: text
- phone: varchar(50)
- gallery: json (Array de URLs)
- created_at: timestamp

### Tabela: `massages`
- id: varchar(36) (UUID)
- title: varchar(255)
- slug: varchar(255) (Unique)
- description: text
- duration: varchar(50)
- price: decimal(10,2)
- image: text (URL R2)
- therapists: json (Array de slugs relacionados)
- created_at: timestamp

## APIs Internas
Todas as rotas implementam estratégia de **Graceful Degradation**: tentam conexão com MySQL; se falhar (timeout/erro), leem/escrevem nos arquivos JSON locais.

- GET /api/therapists
  - SELECT * FROM therapists.
- POST /api/therapists
  - INSERT INTO therapists. Valida slug.
- PUT /api/therapists
  - UPDATE therapists WHERE slug = ?.
- DELETE /api/therapists?slug=...
  - DELETE FROM therapists WHERE slug = ?.
- GET /api/massages
  - SELECT * FROM massages.
- POST /api/massages
  - INSERT INTO massages.
- PUT /api/massages
  - UPDATE massages WHERE slug = ?.
- DELETE /api/massages?slug=...
  - DELETE FROM massages WHERE slug = ?.
- POST /api/upload
  - Body: multipart/form-data (file, key)
  - Envia arquivo ao R2 (PutObject), retorna URL pública.
- POST /api/upload-from-url
  - Body: JSON { url, key }
  - Faz download de uma URL e reenvia ao R2; retorna URL pública.
- GET /api/import/therapists
  - Tenta extrair nomes/imagens do site de referência e atualiza dataset; sobe imagens no R2.

## Fluxo de Upload de Imagens
- Adição/Edição em Admin envia arquivo via /api/upload (file, key).
- A API cria uma chave organizada por entidade:
  - therapists/{slug}/profile-<timestamp>.ext
  - therapists/{slug}/gallery-<timestamp>-<index>.ext
  - massages/{slug}/cover-<timestamp>.ext
- Resposta inclui URL pública (R2_PUBLIC_URL/key) usada nos campos image/gallery.
- Alternativa: upload-from-url para importar imagens públicas sem baixar localmente.

## Interface Pública
- /massagens
  - Lista cards de massagens com imagem, título e descrição.
  - Busca em SSR via GET /api/massages e /api/therapists (associa terapeutas por slug).
- /massagens/[slug]
  - Detalhe da massagem com imagem e terapeutas relacionados.
  - SSR dinâmica; fallback simples para alguns slugs comuns.
- /terapeutas
  - Lista de terapeutas com imagem e especialidades.
  - SSR via GET /api/therapists.
- /terapeutas/[slug]
  - Detalhe da terapeuta com imagem e galeria.
  - SSR dinâmica; fallback opcional.
- /sobre
  - Página institucional; SSR com terapeutas para destaque.

## Interface Admin
- /admin
  - Visão geral com contagens de terapeutas/massagens.
- /admin/terapeutas
  - Formulário de adição:
    - Campos: Nome, Slug (auto), Telefone, Bio, Foto (Upload), Galeria (Upload múltiplo), Especialidades.
    - Salva via POST /api/therapists.
  - Listagem com ações: Editar, Remover.
- /admin/terapeutas/[slug]
  - Formulário de edição:
    - Campos iguais à adição; atualiza via PUT /api/therapists.
    - Upload substitui imagem/galeria sem exigir links.
- /admin/massagens
  - Formulário de adição:
    - Campos: Título, Slug (auto), Descrição, Duração, Preço, Imagem (Upload), Terapeutas (checkbox por slug).
    - Salva via POST /api/massages.
  - Listagem com ações: Editar, Remover.
- /admin/massagens/[slug]
  - Formulário de edição:
    - Atualiza via PUT /api/massages; upload de imagem.

## Políticas de Renderização e Fetch
- SSR nas páginas do App Router com fetch apontando para NEXT_PUBLIC_BASE_URL (fallback localhost) para evitar “Invalid URL”.
- cache: "no-store" em fetch nas páginas SSR para dados sempre atualizados.
- Imagens remotas autorizadas via next.config.ts:
  - r2.dev (domínio público do bucket)
  - images.unsplash.com (exemplos/fallback)

## Tratamento de Erros
- APIs CRUD retornam:
  - { error: "exists" } (409) quando slug já existe.
  - { error: "not_found" } (404) quando item não existe em PUT/DELETE.
  - { error: "missing_slug" } (400) quando slug ausente em DELETE.
- Upload:
  - { error: "invalid_request" } (400) quando dados ausentes.
  - { error: "download_failed" } (502) em upload-from-url quando a origem falha.
- Import:
  - { error: "source_fetch_failed" } (502) quando o site de referência bloqueia ou falha.
  - { error: "import_failed", message } (500) em falhas genéricas.

## Segurança
- Segredos do R2 somente via variáveis de ambiente; nunca em código.
- Sem logs de credenciais; apenas erros genéricos nas rotas de upload/import.
- Uploads organizados por entidade/slug para isolamento lógico.

## Build e Execução
- Desenvolvimento: npm run dev (http://localhost:3000).
- Lint: npm run lint (ESLint 9).
- Build: npm run build; Produção: npm run start.
- Dev server valida rotas e compila dinamicamente com Turbopack.

## Considerações de SEO/Imagens
- next/image com otimização, classes responsivas e object-cover.
- Importador tenta usar meta og:image quando disponível nas páginas de perfil.

## Extensões Futuras
- Autenticação para /admin (proteção de acesso).
- Tipagem forte para APIs e componentes (reduzir uso de any).
## Arquitetura Lógica
- Camadas:
  - Interface (App Router, componentes React, páginas públicas e admin).
  - API (rotas em /api com handlers server-side).
  - Dados (MySQL + fallback JSON + armazenamento de arquivos no R2).
- Fluxo geral:
  - Páginas SSR consultam /api/* para obter dados normalizados.
  - Admin usa formulários client-side e submete dados via fetch para APIs.
  - Uploads são enviados do browser para o backend e persistidos no R2; URLs públicas retornam para preenchimento dos modelos.
  - Imagens são renderizadas via next/image com remotePatterns autorizados.

## App Router e Navegação
- Estrutura:
  - (site) é o grupo de rotas públicas e admin com layout compartilhado.
  - Páginas de nível:
    - / (landing)
    - /massagens e /massagens/[slug]
    - /terapeutas e /terapeutas/[slug]
    - /sobre
    - /admin, /admin/terapeutas, /admin/terapeutas/[slug], /admin/massagens, /admin/massagens/[slug]
- Comportamento:
  - Páginas públicas renderizam no servidor, consumindo APIs sem cache persistente (no-store).
  - Páginas admin renderizam um formulário cliente, mantendo estados locais controlados.
  - Links usam Link do Next para navegação SPA com fallback SSR.

## Convenções de Código
- Tipagem:
  - Preferir tipos explícitos (interfaces para Therapist e Massage) e evitar any.
  - Serialização JSON para arrays em campos TEXT no MySQL.
- Estilo:
  - Componentes funcionais, hooks do React (useState, useEffect).
  - CSS utilitário com classes Tailwind e transições consistentes.
- Fetch:
  - SSR com fetch apontando para NEXT_PUBLIC_BASE_URL (fallback http://localhost:3000).
  - cache: "no-store" para garantir dados frescos.
- Erros:
  - Retornos de API sempre JSON com { ok } ou { error } e status HTTP semânticos.

## Modelagem de Domínio
- Entidade Therapist:
  - Identidade: slug (único, derivado do nome).
  - Atributos:
    - name: nome exibido.
    - specialties: lista de especialidades em formato livre.
    - image: URL pública de imagem principal.
    - bio: texto descritivo.
    - phone: contato (ex.: WhatsApp).
    - gallery: lista de URLs públicas de imagens.
- Entidade Massage:
  - Identidade: slug (único, derivado do título).
  - Atributos:
    - title: nome comercial da massagem.
    - description: resumo/benefícios.
    - duration: texto com duração (ex.: "60 min").
    - price: número (decimal).
    - image: URL pública (capa).
    - therapists: lista de slugs de terapeutas que oferecem a massagem.
- Regras:
  - Slugs são estáveis e servem como chaves de referência cruzada.
  - Relação Massage→Therapist é via slug string (não foreign key no banco, por simplicidade).

## Banco de Dados (MySQL)
- Biblioteca: mysql2/promise.
- Pool:
  - Conexões com waitForConnections, connectionLimit=10.
  - Parâmetros via .env (MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD).
- Schema:
  - therapists:
    - id INT PK auto_increment
    - slug VARCHAR(150) UNIQUE NOT NULL
    - name VARCHAR(200) NOT NULL
    - specialties TEXT (JSON string)
    - image TEXT
    - bio TEXT
    - phone VARCHAR(50)
    - gallery TEXT (JSON string)
    - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - massages:
    - id INT PK auto_increment
    - slug VARCHAR(200) UNIQUE NOT NULL
    - title VARCHAR(200) NOT NULL
    - description TEXT
    - duration VARCHAR(50)
    - price DECIMAL(10,2)
    - image TEXT
    - therapists TEXT (JSON string)
    - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- Índices:
  - UNIQUE em slug para cada tabela.
  - Índices extras futuros: (title), (name) se necessário para busca rápida.
- Normalização:
  - Armazenamento de arrays como JSON string em TEXT para reduzir complexidade; alternativa futura é tabela pivô massage_therapist.
- Migração:
  - Seed POST /api/seed migra JSON local para MySQL, evitando duplicação por slug.

## APIs — Contratos Detalhados
- GET /api/therapists
  - 200: Therapist[] (todos os campos normalizados).
  - Fallback: retorna JSON local se MySQL indisponível.
  - Erros: 500 (exceções inesperadas, mas mascaradas pelo fallback).
- POST /api/therapists
  - Body:
    - { slug, name, specialties[], image, bio, phone, gallery[] }
  - 201/200: { ok: true }
  - 409: { error: "exists" } se slug já existir.
  - Fallback: persiste em JSON local se MySQL falhar.
- PUT /api/therapists
  - Body idêntico ao POST.
  - 200: { ok: true }
  - 404: { error: "not_found" } se não existir.
  - Fallback: atualiza JSON local se MySQL falhar.
- DELETE /api/therapists?slug=...
  - 200: { ok: true }
  - 400: { error: "missing_slug" }
  - Fallback: remove de JSON local se MySQL falhar.
- GET /api/massages
  - 200: Massage[].
  - Fallback: retorna JSON local.
- POST /api/massages
  - Body:
    - { slug, title, description, duration, price, image, therapists[] }
  - 200: { ok: true }, 409: { error: "exists" }.
  - Fallback: persiste em JSON local.
- PUT /api/massages
  - Body idêntico ao POST.
  - 200: { ok: true }, 404: { error: "not_found" }.
  - Fallback: atualiza JSON local.
- DELETE /api/massages?slug=...
  - 200: { ok: true }, 400: { error: "missing_slug" }.
  - Fallback: remove de JSON local.
- POST /api/upload
  - multipart/form-data:
    - file: arquivo binário.
    - key: string (caminho destino no bucket).
  - 200: { url } com URL pública R2; 400: invalid_request; 502: erros de upload.
- POST /api/upload-from-url
  - JSON: { url, key }
  - 200: { url } (upload via backend); 400/502 em caso de falha.
- GET /api/import/therapists
  - Busca páginas do site de referência, extrai imagens (img/og:image), sobe ao R2, atualiza dataset.
  - Respostas: { ok, imported } ou { error, message }.
  - Observações: pode falhar por proteção de scraping; use upload-from-url como fallback.
- POST /api/seed
  - Migra JSON local (therapists.json, massages.json) para MySQL.
  - Resposta: { ok, imported: { therapists, massages } }.

## Upload — Detalhes Técnicos
- Cliente:
  - FormData com file e key.
  - Tratamento de estado de loading e erro no form.
- Backend:
  - S3Client com endpoint R2 (region auto, endpoint com ACCOUNT_ID).
  - PutObjectCommand com Bucket, Key, Body (Buffer), ContentType.
- Chaves de armazenamento:
  - therapists/{slug}/profile-{timestamp}.{ext}
  - therapists/{slug}/gallery-{timestamp}-{i}.{ext}
  - massages/{slug}/cover-{timestamp}.{ext}
- Tipos:
  - Content-Type derivado do arquivo (image/jpeg, image/png, image/webp).
  - Extensão calculada por content-type quando importado por URL.
- URL pública:
  - R2_PUBLIC_URL concatenado com /{Key}.
  - Integrado às páginas via next/image.

## next.config.ts — Imagens
- images.remotePatterns:
  - https://images.unsplash.com — exemplos/fallback.
  - https://pub-*.r2.dev — domínio público do bucket R2.
- unoptimized: true em dev para praticidade; otimização pode ser ativada em produção.

## Interface Admin — Terapeutas
- Adição:
  - Slug automático gerado via função slugify no client.
  - Foto (Upload):
    - Input file aceita image/*, onChange dispara upload para /api/upload.
    - Atualiza campo image com a URL retornada.
  - Galeria (Upload múltiplo):
    - Input multiple, mapeia cada arquivo para key única e faz uploads em paralelo.
    - Atualiza lista de URLs.
  - Especialidades:
    - Checkboxes/inputs simples; armazenadas em specialties[].
  - Validação:
    - Nome e slug obrigatórios; demais opcionais.
  - Submissão:
    - POST /api/therapists; exibe erro se 409 exists.
- Edição:
  - Carrega dados via GET /api/therapists e filtra por slug.
  - Campos iguais, PUT para atualizar.
  - Navegação: volta para listagem após sucesso.
- Remoção:
  - DELETE com query param slug; atualiza listagem com refresh.

## Interface Admin — Massagens
- Adição:
  - Slug automático a partir do título.
  - Imagem (Upload) com mesma lógica de terapeutas.
  - Terapeutas:
    - Checkboxes geradas dinamicamente a partir do GET /api/therapists.
  - Submissão:
    - POST /api/massages com therapists como array de slugs.
- Edição:
  - Carregamento por slug, PUT para persistir.
- Remoção:
  - DELETE por slug; atualização da lista.

## Páginas Públicas — Massagens
- Lista:
  - SSR: obtém massages e therapists, compõe cartões com imagem, título, descrição.
  - UI:
    - Grid responsivo, hover com escala na imagem (transition).
  - Acessibilidade:
    - Alt na imagem, títulos semânticos, contraste de cores.
- Detalhe:
  - SSR dinâmica por slug; busca a massagem e seus terapeutas relacionados.
  - Fallback:
    - Mapeamento de slugs comuns para auxiliar navegação.
  - Conteúdo:
    - Imagem de capa, descrição, terapeutas que realizam.

## Páginas Públicas — Terapeutas
- Lista:
  - SSR: obtém terapeutas do MySQL (ou JSON fallback).
  - UI:
    - Card com imagem, nome, especialidades.
  - A11y:
    - Navegação por teclado, foco visível, sem elementos interativos ocultos.
- Detalhe:
  - SSR por slug; exibe imagem principal, bio, galeria com preview.
  - Otimização:
    - lazy loading de imagens via next/image.

## Estado e Hooks
- useState para campos de formulários.
- useEffect para carregamento inicial de dados em admin.
- router.refresh para atualização da UI após operações.
- Tratamento de erros:
  - setError com mensagens curtas e consistentes.
  - Disabled em botões enquanto loading.

## Validações e Regras
- Slug:
  - Somente a-z0-9 e '-' gerados via normalização NFD e remoção de diacríticos.
- Obrigatoriedade:
  - Terapeutas: name e slug.
  - Massagens: title e slug.
- Duplicidade:
  - APIs retornam 409 exists.
- Tipos numéricos:
  - price serializado para número; entrada via input type="number".

## Segurança e Segredos
- Segredos exclusivamente por .env:
  - R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.
  - MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_DATABASE, MYSQL_PORT.
- Nunca logar segredos.
- CORS:
  - Rotas internas acessadas no mesmo domínio; sem exposição cross-domain.
- Upload:
  - Faz upload no backend; cliente não conhece segredos de R2.

## Desempenho
- SSR com no-store: evita stale, aceita custo de fetch por request.
- Turbopack acelera HMR e build dev.
- next/image otimiza carregamento e dimensionamento.
- Evitar ciclos de re-render dispendiosos; usar keys estáveis em lists.
- Minimização de bundles:
  - Somente dependências necessárias; sem bibliotecas pesadas para tarefas simples.

## Observabilidade (Sugerido)
- Logs:
  - Erros críticos nas APIs com status codes adequados.
  - Info básica em dev (console) limitada para não poluir.
- Métricas:
  - Latência de APIs (pode integrar com APM futuro).
  - Contagem de uploads bem-sucedidos/fracassados.
- Tracing:
  - Possível integração com OpenTelemetry em futuras versões.

## Testes (Plano)
- Unitários:
  - Funções utilitárias (slugify).
  - Serialização/deserialização de arrays (safeParseArray).
- Integração:
  - Rotas /api/* com cenários happy-path e erro (exists, not_found).
  - Uploads: simular FormData e validar resposta de URL.
- E2E:
  - Fluxos admin: adicionar terapeuta, editar, remover, adicionar massagem, alterar imagem.
  - Fluxos públicos: renderizar listas e detalhes sem erros.

## Deploy e Ambientes
- Dev:
  - npm run dev.
- Prod:
  - npm run build; npm run start.
  - Configurar NEXT_PUBLIC_BASE_URL para apontar para domínio production.
- Variáveis em produção:
  - Definir todos os segredos no provedor de hospedagem (sem commit).
- Banco:
  - Garantir segurança do MySQL (usuário com permissões mínimas, host restrito).

## Dados — Importação do Site de Referência
- Objetivo:
  - Capturar nomes e imagens das terapeutas do site indicado para preencher o sistema.
- Estratégia:
  - GET /api/import/therapists tenta localizar imagens (img, og:image) nas páginas.
  - Sobe para R2 e atualiza dataset.
- Restrições:
  - Sites podem bloquear scraping (protection, rate limits); usar upload-from-url alternativo.
- Alternativa:
  - Copiar manualmente URLs de imagens e usar POST /api/upload-from-url com key adequada.

## Cache e Políticas
- Sem cache persistente em SSR para evitar inconsistências durante edição.
- Imagens:
  - Podem ser cacheadas pelo browser/CDN (r2.dev) com cabeçalhos padrão.
- Considerar no futuro:
  - Stale-while-revalidate para páginas públicas quando volume crescer.

## Acessibilidade (A11y)
- Imagens com alt descritivo.
- Foco visível em botões e links.
- Uso de semântica HTML em títulos e sections.
- Contraste entre texto e fundo respeitando WCAG AA.
- Navegação por teclado sem impedimentos.

## Internacionalização (i18n) — Futuro
- Base atual em Português.
- Estruturação possível:
  - dicionários por locale em /src/i18n.
  - next-intl ou uso leve customizado.
- Rotas:
  - prefixos /pt, /en, /es se necessário.

## SEO
- Títulos claros nas páginas (h1, h2).
- Metatags dinâmicas por slug (massagens e terapeutas).
- og:image pode usar URL pública do R2 para cards sociais.
- Sitemap e robots em futuras versões.

## Conformidade e Privacidade
- Dados pessoais limitados (nome, telefone); sem dados sensíveis.
- Remoção e atualização via painel admin.
- Logs sem dados pessoais.

## Backup e Recuperação
- Banco:
  - Dumps periódicos (mysqldump) com retenção adequada.
  - Scripts para restauração.
- Arquivos:
  - R2 possui versionamento opcional; considerar habilitar para rollbacks.
- Seed:
  - /api/seed permite reimportar dados base em caso de falha.

## Estratégia de Migração (JSON → MySQL)
- Seed inicial:
  - Importa JSON local para tabelas MySQL, respeitando slugs.
- Operação mista:
  - Fallback implementado para manter o site operante se MySQL indisponível.
- Corte definitivo:
  - Remover fallback quando ambiente estiver estável e monitorado.

## Segurança de Upload
- Validação de Content-Type básica.
- Tamanho:
  - Limitar pelo reverse proxy/CDN (futuro) para evitar grandes uploads.
- Nomes de arquivos:
  - Não confiar em nomes do cliente; usar keys com timestamp e randomização.

## Performance de Imagens
- Pró-ativa:
  - Formatos webp quando possível (import-from-url mantém content-type).
- Responsivo:
  - next/image gerencia diferentes DPRs e tamanhos.
- Lazy loading e prioridade:
  - Capa e heros podem ter priority; galerias lazy.

## Inventário de Componentes (Resumo)
- Home:
  - Seções com animações leves (framer-motion).
- Massages list/detail:
  - Cartões com imagem, títulos e descrições.
- Therapists list/detail:
  - Card com imagem e lista de especialidades; detalhe com bio e galeria.
- Admin forms:
  - Inputs básicos, textareas, file inputs, checkboxes; botões de submit com loading.

## Políticas de Erro — UX
- Mensagens curtas e objetivas:
  - "Título é obrigatório", "Falha ao enviar imagem", "Erro ao salvar".
- Estados visuais:
  - Disabled durante loading para prevenir duplo submit.
- Recuperação:
  - Em erros de rede, permitir tentar novamente sem perda de dados do form.

## Logs e Auditoria (Plano)
- Registrar ações admin (create/update/delete) com timestamp (já gravado em DB).
- Auditoria avançada:
  - Tabelas de histórico (futuro) para rastrear mudanças.

## Proteção de Admin (Futuro)
- Autenticação:
  - JWT ou NextAuth com provedores.
- Autorização:
  - Papel admin com guarda nas rotas.
- CSRF:
  - Tokens para POST/PUT/DELETE se interface fizer navegadores cruzados.

## Qualidade de Código
- Lint:
  - ESLint com regras de TypeScript (evitar any).
  - Correção de react/no-unescaped-entities.
- Formatação:
  - Padronização de strings e classes Tailwind.

## Plano de Indíces e Otimização SQL
- Therapists:
  - slug UNIQUE vai garantir busca e update rápido.
  - name INDEX (opcional) para ordenações frequentes.
- Massages:
  - slug UNIQUE.
  - title INDEX (opcional) para listagens ordenadas.
- Consultas:
  - SELECT colunas específicas para reduzir payload.

## Roteiro de Escalabilidade
- Separar leituras e escritas:
  - Replicação MySQL (futuro) com read replicas.
- CDN para imagens:
  - r2.dev + reverse proxy configurado com cache longo.
- Partitionamento:
  - Se volume crescer, mover arrays para tabelas normalizadas.

## Integrações Externas Potenciais
- WhatsApp:
  - Link direto para contato de terapeutas.
- Pagamentos:
  - Checkout (Stripe/Pagarme) para pacotes de reservas (futuro).
- Analytics:
  - Plausible/GA para métricas de navegação.

## Práticas de Desenvolvimento
- Commits:
  - Mensagens claras, sem segredos.
- PRs:
  - Revisão simples em features maiores.
- Branching:
  - main estável; feature branches para mudanças notáveis.

## Manutenção
- Atualizações de dependências:
  - next, react, mysql2, aws-sdk.
- Segurança:
  - npm audit fix periódico.
- Monitoramento:
  - Alertas básicos (uptime) e logs de erro.

## Guia de Troubleshooting
- Erro “Invalid URL” em SSR:
  - Garantir NEXT_PUBLIC_BASE_URL definido ou fallback http://localhost:3000.
- Erro “ECONNREFUSED” MySQL:
  - Verificar MYSQL_HOST/PORT e credenciais; checar firewall/host remoto.
- “Unexpected end of JSON input”:
  - APIs retornando não-JSON por falha; usar fallback local implementado.
- Upload 400 invalid_request:
  - Checar envio de file e key no FormData/JSON.
- Imagem 404 em r2.dev:
  - Confirmar que PutObject foi bem-sucedido e key correta.

## Diretrizes de UX
- Textos curtos, títulos serif em páginas principais.
- Botões com estados de hover e disabled.
- Feedback pós-salvar (voltar à listagem, refresh).

## Roadmap
- Autenticação e RBAC para admin.
- Busca por massagem/terapeuta.
- Filtros e ordenação avançados.
- Galerias com lightbox e thumbnails.
- Internacionalização plena.
- Logs estruturados e monitoramento.
- CI/CD com testes e lint automatizados.

## Exemplos de Payloads
- POST /api/therapists:
  - { "slug": "beatriz", "name": "Beatriz", "specialties": ["Massagem Nuru"], "image": "https://...", "bio": "texto", "phone": "351...", "gallery": ["https://..."] }
- POST /api/massages:
  - { "slug": "massagem-nuru", "title": "Massagem Nuru", "description": "texto", "duration": "60 min", "price": 200, "image": "https://...", "therapists": ["beatriz", "sofia"] }

## Exemplos de Respostas de Erro
- 409 exists:
  - { "error": "exists" }
- 404 not_found:
  - { "error": "not_found" }
- 400 missing_slug:
  - { "error": "missing_slug" }
- 400 invalid_request (upload):
  - { "error": "invalid_request" }

## Segurança de Banco
- Usuário MySQL com permissões mínimas (SELECT/INSERT/UPDATE/DELETE).
- Acesso restrito por host.
- Senhas em .env; nunca em repositório.
- Rotinas de backup com rotação.

## Organização de Chaves R2
- Separação por entidade/slug para facilitar limpeza e migração.
- Nomes com timestamp para evitar colisões.
- Opção de prefixos adicionais para ambientes (dev/prod) em futura configuração.

## Compatibilidade
- Navegadores modernos; uso de recursos compatíveis.
- Serverless/Node runtime: Next.js API routes funcionam em edge (opcional) ou node runtime padrão.

## Documentação Interna
- Este specs.md descreve:
  - Componentes, APIs, modelos, fluxos, segurança, performance, manutenção.
- Manter atualizado ao evoluir features (admin auth, normalização DB).

## Checklist Operacional
- .env configurado com R2 e MySQL.
- next.config.ts com remotePatterns corretos.
- Dev server iniciando sem erros.
- APIs CRUD respondem 200.
- Uploads retornam URL pública e imagem renderiza em pages.
- Admin adiciona/edita/remove itens com sucesso.
- Seed executado (quando necessário).

## Padrões de Slug
- Geração:
  - lower-case, remoção de acentos, espaços viram '-' e colapsos.
- Colisões:
  - Bloqueadas por UNIQUE; exibir erro e permitir ajuste manual.

## Renderização de Lista
- Massagens:
  - Grid 1-3 colunas (responsive), cartões com hovers suaves.
- Terapeutas:
  - Cards com avatar, nome e especialidades compactas.
- Ações:
  - Links para páginas de detalhe com classNames consistentes.

## Design do Form
- Layout:
  - Grid colunas, labels uppercase pequenas (tracking-widest).
  - Inputs com borda leve e radius pequeno.
- Feedback:
  - Erros em texto vermelho (text-red-600).
  - Sucesso: navegação/refresh e limpeza de campos.

## Serialização
- Arrays:
  - JSON.stringify antes de salvar no MySQL.
  - safeParseArray ao ler do MySQL para converter TEXT→array.
- Números:
  - price convertido com Number e armazenado como DECIMAL(10,2).

## Segurança de Conteúdo
- Evitar HTML em bio/description; manter texto simples para prevenir XSS.
- Sanitização futura:
  - Biblioteca de sanitize para conteúdos ricos se necessário.

## Política de Atualizações
- Atualizar imagens:
  - Re-upload substitui URL; remover antigas manualmente ou por rotina futura.
- Edição de slugs:
  - Evitar; slug usado como id; se necessário, criar novo item e migrar referências.

## Limites e Quotas (Futuro)
- Upload size limite por rota.
- Rate limit em /api/* para evitar abuso.
- Proteção contra brute force em /admin quando houver auth.

## Monitoramento de Erros
- Captura de exceptions em rotas; logs com digest simples.
- Página de erro amigável para 500 em admin.

## Scripts de Manutenção (Sugestões)
- CLI para importar imagens em lote via upload-from-url.
- Conversores JSON↔SQL para migrações pontuais.

## Estratégias de Cache de Dados
- In-memory caching leve em futuras versões para GET frequentes.
- Revalidação programada após writes.

## Inclusão de Conteúdo Multimídia (Futuro)
- Vídeos de demonstração das massagens:
  - Armazenamento em R2 com streaming via player leve.
- Áudios de instrução:
  - Arquivos leves com preview.

## Guidelines Visuais
- Tipografia:
  - Serif para títulos, sans-serif para corpo.
- Paleta:
  - Tons de slate, gold para destaque.
- Espaçamento:
  - Padding consistente; grids com gaps responsivos.

## Estrutura de Pastas (Detalhada)
- src/app/(site)/admin/terapeutas:
  - page.tsx (listagem + form)
  - _form.tsx (form adição)
  - _edit-form.tsx (form edição)
  - _delete-button.tsx (ação de remover)
- src/app/(site)/admin/massagens:
  - page.tsx (listagem + form)
  - _form.tsx (form adição)
  - _edit-form.tsx (form edição)
  - _delete-button.tsx (remoção)
- src/app/(site)/terapeutas:
  - page.tsx (lista pública)
  - [slug]/page.tsx (detalhe pública)
- src/app/(site)/massagens:
  - page.tsx (lista pública)
  - [slug]/page.tsx (detalhe pública)
- src/app/api:
  - therapists/route.ts
  - massages/route.ts
  - upload/route.ts
  - upload-from-url/route.ts
  - import/therapists/route.ts
  - seed/route.ts
- src/data:
  - therapists.json
  - massages.json
- src/lib:
  - db.ts

## Naming Conventions
- Componentes com PascalCase.
- Funções utilitárias camelCase.
- Slugs kebab-case.
- Chaves R2 legíveis e previsíveis.

## Práticas de Segurança Complementares
- Helmet (futuro) para cabeçalhos de segurança.
- Content Security Policy restritiva para imagens e scripts.
- Rate limits em upload/import para evitar abuso.

## Disponibilidade e Resiliência
- Fallback de dados JSON garante continuidade em falha MySQL.
- Uploads via backend previnem exposição de credenciais.
- Monitoramento de status das rotas (200/500) em dev.

## Integração com CDN (Futuro)
- Proxying de r2.dev com headers long-lived.
- Invalidação seletiva após atualizações importantes.

## Estratégia de Testes de Carga (Plano)
- Simular N usuários navegando nas listas e detalhes.
- Uploads simultâneos com limites T.
- Monitorar latência, throughput e erros.

## Critérios de Aceitação
- Admin consegue criar/editar/remover terapeutas/massagens sem erros.
- Imagens sobem ao R2 e aparecem nas páginas públicas.
- Listas públicas rendem SSR sem “Invalid URL” e sem erro 500.
- Fallback JSON funciona quando MySQL indisponível.

## Manuais de Operação
- Como adicionar nova terapeuta:
  - Preencher campos, fazer upload de foto/galeria, salvar.
- Como adicionar nova massagem:
  - Preencher título, descrição, preço, imagem, selecionar terapeutas, salvar.
- Como importar imagens do site:
  - Tentar GET /api/import/therapists; se falhar, usar upload-from-url.

## Estrutura de Mensagens do Sistema
- Sucesso:
  - “Salvando...”, “Adicionar Terapeuta”, “Gerir Massagens”.
- Erros:
  - Textos simples e diretos.
- Navegação:
  - “Voltar” com estilos consistentes.

## Modo de Desenvolvimento
- HMR com Turbopack.
- Verificação ocasional das rotas 404/500.
- ESLint para manter padrões.

## Integração de Conteúdo com R2
- Rota upload usa PutObject direto.
- upload-from-url baixa e reenvia, ideal para imagens públicas.
- import/therapists tenta scraping mínimo com heurísticas.

## Plano de Evolução do Banco
- Normalizar relacionamentos:
  - Tabela therapist_specialty e massage_therapist (pivot) se necessário.
- Chaves estrangeiras:
  - Considerar se normalizado; hoje via slug pela simplicidade operante.

## Análise de Risco
- Risco de indisponibilidade MySQL:
  - Mitigado por fallback JSON; monitorar e ajustar host/credenciais.
- Risco de abuso de upload:
  - Limites e autenticação futura.
- Risco de scraping falho:
  - Fallback via upload-from-url/manual.

## Guia de Contribuição (Futuro)
- Padrões de PR, testes, lint obrigatório, revisão.
- Sem commits de segredos; uso de .env.sample.

## Checklist de Preparação para Produção
- .env completo e sem espaços extras em URLs.
- Host MySQL correto (não localhost, se remoto).
- RemotePatterns no next.config.ts ajustados.
- Teste de CRUD e uploads no ambiente real.

## Utilitários e Helpers
- safeParseArray:
  - Converte TEXT/JSON string em array seguro.
- slugify:
  - Remove acentos e normaliza caracteres.

## Políticas de Design Responsivo
- Breakpoints:
  - grids adaptam 1→2→3 colunas.
- Imagens:
  - object-cover e transições suaves.
- Tipografia:
  - Escala proporcional em telas maiores.

## Governança de Dados
- Slugs como chaves naturais.
- Prevenção de duplicatas por UNIQUE + validação.
- Regras de retenção em backups.

## Documentação de Rotas Admin
- /admin:
  - Cards com contagens; links para módulos.
- /admin/terapeutas:
  - Form + list; actions: Editar/Remover.
- /admin/terapeutas/[slug]:
  - Edição com upload.
- /admin/massagens:
  - Form + list; actions.
- /admin/massagens/[slug]:
  - Edição com upload.

## Checklist de Qualidade
- Sem erros de lint críticos.
- Sem uso indevido de any.
- Páginas sem strings sem escapamento indevido.
- Acessibilidade básica atendida.

## Planejamento de Funcionalidades Futuras
- Reservas e agenda:
  - Calendário, disponibilidade, confirmações.
- Integração de pagamento:
  - Checkout seguro e logs de transações.
- Notificações:
  - Emails/SMS/WhatsApp.

## Diretrizes de Publicação de Conteúdo
- Títulos claros e sem ambiguidades.
- Descrições sem claims médicos.
- Imagens coerentes e legais.

## Política de Suporte
- Logs e respostas das APIs como fonte primária de diagnóstico.
- Script seed para reconstituir dados base.
- Migrações controladas com backups.

## Conclusão Técnica
- Arquitetura simples, robusta, extensível.
- Upload seguro via backend, armazenamento R2.
- SSR com fallback assegura alta disponibilidade.
- Admin funcional para gestão completa de conteúdo.

## Apêndice A — Exemplos de Chaves de Upload
- therapists/beatriz/profile-1731289059.jpg
- therapists/beatriz/gallery-1731289060-0.webp
- massages/massagem-nuru/cover-1731289061.png

## Apêndice B — Estrutura JSON Interna (Exemplos)
- Therapist:
  - { "id":"beatriz","slug":"beatriz","name":"Beatriz","specialties":["Massagem Nuru"],"image":"https://r2/...","bio":"...","phone":"351...","gallery":["https://r2/..."] }
- Massage:
  - { "id":"massagem-nuru","slug":"massagem-nuru","title":"Massagem Nuru","description":"...","duration":"60 min","price":200,"image":"https://r2/...","therapists":["beatriz"] }

## Apêndice C — Dicas de Operação
- Evitar edição manual de JSON ao usar MySQL.
- Manter slugs estáveis; mudanças exigem migração.
- Conservar URLs públicas e verificar permissões no bucket.

## Apêndice D — Glossário
- SSR: Server-Side Rendering.
- Slug: identificador de URL em minúsculas, sem acentos, com '-'.
- R2: Armazenamento compatível S3 da Cloudflare.
- remotePatterns: lista de hosts permitidos para next/image.
- Fallback: mecanismo de retorno alternativo quando principal falha.

## Apêndice E — Roadmap Técnico Detalhado
- Sprints sugeridos:
  - S1: Auth + proteção de admin.
  - S2: Busca e filtros.
  - S3: Normalização de dados em tabelas pivô.
  - S4: Testes E2E e CI/CD.
  - S5: Performance e caching avançado.
  - S6: Internacionalização.
  - S7: Integração de pagamentos.

## Apêndice F — Guia de Erros Comuns
- ECONNREFUSED:
  - Banco inacessível; revisar host/porta/firewall.
- 404 em imagens:
  - Key incorreta ou objeto não existente; re-fazer upload.
- 409 exists:
  - Slug duplicado; ajustar dados e reenviar.

## Apêndice G — Exemplos de Consultas SQL
- Inserir terapeuta:
  - INSERT INTO therapists (slug,name,specialties,image,bio,phone,gallery) VALUES ('beatriz','Beatriz','["Massagem Nuru"]','','','','[]');
- Atualizar massagem:
  - UPDATE massages SET price=200 WHERE slug='massagem-nuru';
- Deletar terapeuta:
  - DELETE FROM therapists WHERE slug='beatriz';

## Apêndice H — Diretrizes de Publicação
- Revisar ortografia e acentuação em nomes e títulos.
- Garantir que imagens estejam apropriadas e com direitos.
- Manter telefone atualizado para contatos.

## Apêndice I — Perfis de Usuário (Futuro)
- Admin:
  - Acesso total a CRUD.
- Editor:
  - Edição parcial, sem remover.
- Viewer:
  - Apenas leitura (público).

## Apêndice J — Suporte a Galerias
- Ordenação:
  - Na edição, permitir reordenar imagens (futuro).
- Remoção:
  - Botões por item com confirmação.
- Pré-visualização:
  - Thumbnails geradas automaticamente.

## Apêndice K — Integração com Outros Sistemas
- CMS externo (futuro):
  - Webhooks para atualização.
- ERP (futuro):
  - Sincronização de agenda e finanças.

## Apêndice L — Estrutura de Erros nas APIs
- { error: string, detail?: string }
- 4xx: erros do cliente (validação, falta de parâmetros).
- 5xx: erros do servidor (DB indisponível, exceções).

## Apêndice M — Políticas de Revalidação
- SSR:
  - Revalidar sempre (no-store); opcionalmente adotar revalidate tags futuras.
- Admin:
  - router.refresh pós-escrita para refletir alterações.

## Apêndice N — Configuração de Ambiente
- .env.local em dev:
  - R2_* e MYSQL_* definidos.
- Produção:
  - Variáveis definidas no provedor de cloud; sem spaces ou backticks nas URLs.

## Apêndice O — Estilo de Código
- Imports ordenados.
- Sem side-effects em módulos utilitários.
- Nomes de funções e variáveis claros e descritivos.

## Apêndice P — Planejamento de Logs
- Nível:
  - info para operações normais (em dev), error para falhas.
- Formato:
  - padronizado, sem dados pessoais/sigilosos.

## Apêndice Q — Estratégia de Imagens em Produção
- Compressão:
  - Otimização automática via next/image.
- Dimensões:
  - Tamanhos coerentes para cartões e detalhes.
- CDN:
  - servir via r2.dev + proxies quando necessário.

## Apêndice R — UX de Admin
- Botões com labels claros (“Adicionar Terapeuta”, “Salvar Alterações”).
- Feedback visual imediato em uploads.
- Indicação de erro no topo do form.

## Apêndice S — Planejamento de Segurança
- Rate limits em POST/PUT/DELETE.
- Proteção contra XSS com sanitização futura em campos ricos.
- Auditoria de alterações com histórico (futuro).

## Apêndice T — Compatibilidade de Navegadores
- Suporte moderno (Chrome, Firefox, Safari, Edge).
- Testes em mobile e desktop.
- Considerar fallbacks para features avançadas.

## Apêndice U — Diretrizes de Conteúdo
- Manter consistência em nomes de massagens e especialidades.
- Evitar duplicação de termos.
- Atualizar bio com linguagem apropriada e respeitosa.

## Apêndice V — Planejamento de Integrações
- WhatsApp:
  - deep links em cards de terapeutas.
- Agendamento:
  - integração com calendários (Google/Outlook).

## Apêndice W — Boas Práticas de Deploy
- Testar em staging com dados reais.
- Revisar configs e segredos antes de promover para produção.
- Observabilidade ativa nas primeiras horas pós-deploy.

## Apêndice X — Diretrizes de Performance
- Evitar heavy renders, preferir memoização quando necessário.
- Reduzir reflows e repaints com CSS eficiente.
- Medir tempos de resposta em APIs críticas.

## Apêndice Y — Manutenção de Dependências
- Atualizar libs periodicamente.
- Verificar breaking changes em next/react.
- Testar regressões após updates.

## Apêndice Z — Considerações Finais
- Projeto alinhado à simplicidade e segurança.
- Estrutura pronta para evoluir com auth, pagamentos e i18n.
- Documentação ampla para facilitar onboarding e manutenção.
- Validações de payload mais rígidas no backend.
- Suporte a múltiplos ambientes (dev/staging/prod) com NEXT_PUBLIC_BASE_URL distinto.

## Detalhamento da Interface e Componentes

### 1. Componentes Globais
- **Layout (Header/Footer):**
  - Navegação responsiva.
  - Links para seções principais.
- **Motion UI (`src/components/ui/motion.tsx`):**
  - `FadeIn`, `FadeInStagger`, `FadeInItem`: Wrappers para animações de entrada usando `framer-motion`.

### 2. Página Inicial (`src/app/(site)/page.tsx`)
- **Hero Section (`src/components/home/hero.tsx`):**
  - Vídeo de fundo com overlay escuro (`bg-black/40`).
  - Títulos animados com fonte `Philosopher`.
  - Texto dourado (`text-[#dabe65]`) para destaque de marca.
- **Seção de Massagens (`src/components/home/massages.tsx`):**
  - Grid responsivo (1 col mobile, 2 cols desktop).
  - Cards com efeito de hover:
    - Escala na imagem (`scale-110`).
    - Mudança de cor no título.
    - Botão "Saiba Mais" com seta animada.
  - Fetch SSR de `/api/massages`.
- **Seção de Terapeutas (`src/components/home/therapists.tsx`):**
  - Carrossel horizontal em mobile (`overflow-x-auto`, `snap-x`).
  - Cards verticais com imagem grayscale que ganha cor no hover.
  - Lista de especialidades separada por "•".

### 3. Interface Administrativa
- **Formulário de Terapeutas (`_form.tsx`):**
  - **Estados:**
    - `loading`: Desabilita botão de submit.
    - `slug`: Gerado automaticamente via `slugify(name)`.
    - `galleryUrls`: Array de strings para múltiplas imagens.
  - **Upload:**
    - `onImageSelect`: Upload unitário para profile.
    - `onGallerySelect`: Upload múltiplo (`Promise.all`) para galeria.
  - **Relacionamento:**
    - Checkboxes para vincular massagens (armazenado em `specialties` como strings livres no momento, mas conceitualmente ligado).
- **Formulário de Massagens (`_form.tsx`):**
  - **Campos:** Título, Slug (auto), Descrição, Duração, Preço, Imagem.
  - **Relacionamento:**
    - Checkboxes dinâmicos buscando `/api/therapists` para preencher `therapists[]` (array de slugs).

### 4. Design System & Estilização
- **Cores:**
  - Primária (Texto): `slate-900`.
  - Destaque (Gold): `#dabe65` / `text-gold`.
  - Fundo: `white` / `slate-50`.
- **Tipografia:**
  - Títulos: `font-philosopher`.
  - Labels/Buttons: `uppercase`, `tracking-widest`, `text-xs`, `font-bold`.
- **Inputs:**
  - Bordas leves (`border-slate-200`), `rounded-sm`.
  - Foco e estados de erro (`text-red-600`).

### 5. Componentes de Layout Detalhados

#### Header (`src/components/layout/header.tsx`)
- **Comportamento de Scroll:**
  - Monitora `window.scrollY` para detectar rolagem (> 50px).
  - Aplica fundo branco com desfoque (`bg-white/90 backdrop-blur-md`) e sombra ao rolar.
  - Em topo de página (`scrollY < 50`), mantém fundo transparente na Home para sobreposição ao vídeo.
- **Navegação Mobile:**
  - Menu hambúrguer (`lucide-react/Menu`) transforma-se em `X` ao abrir.
  - Overlay de tela cheia (`fixed inset-0`) com transição de opacidade.
  - Links centralizados com tipografia `font-philosopher` e tamanho aumentado (`text-3xl`).
  - Bloqueio de scroll no corpo da página quando aberto (via classe `pointer-events-auto` no overlay).
- **Logotipo:**
  - Imagem circular (`rounded-full`) com fundo branco para garantir contraste.
  - Posicionamento relativo com `z-index` alto para ficar sobre o vídeo/overlay.

#### Footer (`src/components/layout/footer.tsx`)
- **Estrutura de Grid:**
  - `grid-cols-1` (mobile) a `grid-cols-4` (desktop).
  - Espaçamento generoso (`gap-12`) para respiro visual.
- **Animações de Entrada:**
  - Utiliza `FadeInStagger` para animar colunas sequencialmente.
  - Cada coluna é um `FadeInItem`, criando um efeito de cascata visual ao chegar no rodapé.
- **Seções:**
  - **Marca:** Logo, breve descrição e ícones sociais (Instagram/Facebook) com hover dourado.
  - **Navegação Rápida:** Lista de links úteis.
  - **Horários:** Lista flexível (`flex justify-between`) alinhando dias e horas.
- **Rodapé Inferior:**
  - Linha divisória (`border-t`) separando direitos autorais e links legais (Privacidade/Termos).
  - Texto menor (`text-xs`) e cor suavizada (`text-slate-500`).

### 6. Páginas de Detalhes (Dynamic Routes)

#### Detalhe de Massagem (`src/app/(site)/massagens/[slug]/page.tsx`)
- **Roteamento Dinâmico:**
  - Captura `params.slug` para busca de dados.
  - **Fallback Inteligente:** Se a massagem não for encontrada na API (ex: slugs antigos ou diretos), verifica um mapa local de slugs (`tantrica`, `nuru`, etc.) e renderiza conteúdo estático de fallback. Isso garante que links antigos ou compartilhados não quebrem.
- **Layout Visual:**
  - **Grid Assimétrico:** Coluna de imagem (ocupando altura fixa ou proporcional) vs. Coluna de conteúdo.
  - **Imagem:** Container com `overflow-hidden` e `rounded-sm`.
  - **Informações:** Título grande (`text-4xl`), etiqueta de luxo (`EXPERIÊNCIA EXCLUSIVA`), duração e preço com ícones (`Clock`, `Tag`).
- **Relacionamento com Terapeutas:**
  - Seção inferior listando terapeutas que realizam a massagem.
  - Filtragem feita no client/server cruzando `massage.therapists` (slugs) com a lista completa de terapeutas.
  - Cards de terapeutas reutilizam estilo da home (hover com zoom e overlay).

#### Detalhe de Terapeuta (`src/app/(site)/terapeutas/[slug]/page.tsx`)
- **Perfil Profissional:**
  - Layout focado na imagem pessoal e biografia.
  - Lista de especialidades destacada em dourado e caixa alta.
  - Biografia com tipografia relaxada (`leading-relaxed`) para leitura confortável.
- **Integração WhatsApp:**
  - Bloco de chamada para ação ("Agende com [Nome]").
  - Gera link dinâmico para API do WhatsApp (`wa.me`) pré-preenchendo mensagem com o nome da terapeuta.
  - Sanitização do número de telefone (remove não-dígitos).
- **Galeria de Fotos:**
  - Grid de fotos secundárias (`grid-cols-2` a `grid-cols-4`).
  - Efeito de hover: Zoom suave (`scale-110`) e remoção de overlay escuro.
  - Renderização condicional: Seção inteira oculta se não houver fotos na galeria.

### 7. Seções Institucionais e de Apoio

#### Sobre Nós (`src/components/home/about.tsx`)
- **Composição Visual (Parallax Simulado):**
  - Grid de 12 colunas: 7 para imagens, 5 para texto.
  - **Imagem Principal:** Grande destaque vertical.
  - **Imagem Flutuante:** Pequena imagem sobreposta no canto inferior direito (`absolute -bottom-12 -right-12`), visível apenas em desktop, criando profundidade.
- **Tipografia e Elementos:**
  - Linha decorativa dourada antes do subtítulo "Nossa Essência".
  - Título com quebra de linha (`<br/>`) e itálico na palavra-chave ("desacelera") em dourado.
  - Lista de diferenciais (Privacidade/Conforto) em grid de 2 colunas.
- **Background:**
  - Círculo decorativo desfocado (`blur-3xl`) no fundo para suavizar a transição de seção.

#### Contato (`src/components/home/contact.tsx`)
- **Atmosfera Visual:**
  - Fundo escuro (`bg-slate-900`) para contraste com o restante do site claro.
  - Elementos de luz ("blobs") dourados e azuis com `blur` extremo para criar ambiente etéreo.
- **Grid de Informações:**
  - Lista vertical de canais (Localização, Telefone, Email).
  - Cada item possui ícone em círculo dourado translúcido (`bg-gold/10`).
- **Box de Ação (CTA):**
  - Caixa branca flutuante sobre o fundo escuro.
  - Indicador de "Disponibilidade Hoje":
    - Ponto verde pulsante (`animate-pulse`).
    - Texto "Poucas vagas restantes" para criar senso de urgência (gatilho mental de escassez).

#### Depoimentos (`src/components/home/reviews.tsx`)
- **Estilo dos Cards:**
  - Bordas sutis (`border-slate-700/50`) e fundo branco.
  - Estrelas (`lucide-react/Star`) em cor rosa suave/dourada.
  - Texto em itálico para denotar citação direta.
- **Layout:**
  - Grid de 3 colunas para desktop, pilha vertical em mobile.

#### Botão Flutuante (`src/components/ui/whatsapp-button.tsx`)
- **Posicionamento:**
  - Fixo no canto inferior direito (`bottom-6 right-6`), `z-index` máximo (50).
- **Animação de Entrada:**
  - `framer-motion`: Surge com escala (0 -> 1) e opacidade após delay de 1.5s (para não competir com o carregamento inicial).
  - Efeito `spring` para "pulo" natural ao aparecer.
- **Efeitos Visuais:**
  - Sombra projetada (`shadow-lg`).
  - Animação de "ping" (onda de radar) contínua em um pseudo-elemento para chamar atenção sutilmente.
  - Ícone SVG do WhatsApp vetorizado.

### 8. Painel Administrativo (Dashboard)
- **Visão Geral (`src/app/(site)/admin/page.tsx`):**
  - **Data Fetching:** Realiza busca paralela (`Promise.all`) nas APIs de `/therapists` e `/massages` para contagem rápida.
  - **Cards de Resumo:**
    - Exibe total de registros cadastrados.
    - Botões de ação direta para "Gerir Terapeutas" e "Gerir Massagens".
  - **Design Minimalista:** Focado em utilidade, sem as animações pesadas da área pública.
