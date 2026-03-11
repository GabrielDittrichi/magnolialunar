Aqui está o prompt estruturado para o Trae:

Prompt para o Trae — Melhorias NoarEcom
Você está trabalhando em uma aplicação Next.js 16 (App Router, TypeScript, Tailwind CSS 4) para gestão de terapeutas e massagens. O banco primário é MySQL via mysql2, com fallback em arquivos JSON locais (src/data/therapists.json e src/data/massages.json). Imagens são armazenadas no Cloudflare R2.
Implemente as seguintes melhorias na ordem apresentada:

1. INTEGRIDADE DE DADOS — Cascata no DELETE de Terapeuta
Arquivo: src/app/api/therapists/route.ts
No handler DELETE:

Antes de deletar a terapeuta, buscar todas as massagens (MySQL ou fallback JSON).
Para cada massagem cujo array therapists contém o slug sendo deletado, remover esse slug do array e fazer UPDATE na massagem.
Só então deletar a terapeuta.
Fazer isso tanto no caminho MySQL quanto no caminho fallback JSON.
Se o UPDATE de alguma massagem falhar, logar o erro mas não bloquear o DELETE da terapeuta.


2. INTEGRIDADE DE DADOS — Sincronização do Fallback JSON com MySQL
Arquivo: src/app/api/seed/route.ts (ou criar src/lib/sync-fallback.ts)
Criar uma função utilitária syncFallbackToMySQL() que:

Lê therapists.json e massages.json.
Para cada item, tenta INSERT IGNORE (ou INSERT ... ON DUPLICATE KEY UPDATE) no MySQL usando o slug como chave de deduplicação.
Retorna um resumo { synced: number, skipped: number }.

Expor essa função na rota POST /api/seed com um parâmetro { mode: "sync" } para diferenciá-la do seed inicial.
Além disso, nas rotas POST e PUT de therapists e massages, quando o caminho MySQL falhar e o fallback JSON for usado, adicionar um header X-Data-Source: fallback na resposta para indicar que os dados estão divergentes.

3. PERFORMANCE — Substituir fetch HTTP interno por chamada direta ao banco
Contexto: Páginas SSR como src/app/(site)/massagens/page.tsx, src/app/(site)/terapeutas/page.tsx e src/app/(site)/sobre/page.tsx fazem fetch("${BASE_URL}/api/therapists"). Isso cria uma requisição HTTP desnecessária dentro do mesmo processo.
O que fazer:

Em src/lib/db.ts, exportar funções reutilizáveis: getTherapists(), getMassages(), getTherapistBySlug(slug), getMassageBySlug(slug).
Cada função deve encapsular a lógica MySQL com fallback JSON já existente.
Substituir todos os fetch internos nas Server Components por chamadas diretas a essas funções.
Manter as rotas /api/* existentes intactas (são usadas pelo admin client-side).


4. PERFORMANCE — Cache com revalidação nas páginas públicas de catálogo
Arquivos: src/app/(site)/massagens/page.tsx e src/app/(site)/terapeutas/page.tsx

Após a substituição do fetch do passo anterior, adicionar export const revalidate = 300 no topo de cada arquivo de página de catálogo (lista, não detalhe).
Nas páginas de detalhe [slug]/page.tsx, manter revalidate = 60 para um equilíbrio entre frescor e performance.
Não aplicar revalidate nas páginas do /admin.


5. SEO — generateMetadata nas páginas de detalhe
Arquivos: src/app/(site)/massagens/[slug]/page.tsx e src/app/(site)/terapeutas/[slug]/page.tsx
Exportar generateMetadata em cada uma usando as funções getTherapistBySlug / getMassageBySlug do passo 3:
Para massagens:
tsexport async function generateMetadata({ params }) {
  const massage = await getMassageBySlug(params.slug);
  if (!massage) return { title: "Massagem | NoarEcom" };
  return {
    title: `${massage.title} | NoarEcom`,
    description: massage.description?.slice(0, 155),
    openGraph: {
      title: massage.title,
      description: massage.description?.slice(0, 155),
      images: massage.image ? [{ url: massage.image }] : [],
    },
  };
}
Padrão idêntico para terapeutas, usando name e bio.

6. SEO — Sitemap e robots.txt
Criar: src/app/sitemap.ts

Exportar função default que chama getTherapists() e getMassages() e retorna array com todas as URLs públicas no formato do Next.js App Router.
Incluir rotas estáticas: /, /massagens, /terapeutas, /sobre.
Incluir rotas dinâmicas: /massagens/[slug] e /terapeutas/[slug] para cada item.

Criar: src/app/robots.ts

Exportar função default que retorna regras permitindo todos os crawlers nas rotas públicas e bloqueando /admin e /api.


7. UX ADMIN — Preview de imagem após upload
Arquivos: src/app/(site)/admin/terapeutas/_form.tsx, _edit-form.tsx e equivalentes de massagens.
No campo de upload de foto principal:

Adicionar estado previewUrl: string | null.
No onChange do input file, antes de fazer o upload para a API, setar previewUrl com URL.createObjectURL(file).
Renderizar um <Image> (next/image com unoptimized) abaixo do input quando previewUrl não for null, com tamanho fixo (ex: w-32 h-32 object-cover rounded).
Após o upload concluir com sucesso, substituir previewUrl pela URL pública retornada pela API.
Em caso de erro no upload, limpar previewUrl e exibir a mensagem de erro existente.

Para a galeria, aplicar o mesmo padrão mas como array de previews.

8. UX ADMIN — Confirmação antes de deletar
Arquivos: src/app/(site)/admin/terapeutas/_delete-button.tsx e src/app/(site)/admin/massagens/_delete-button.tsx

Substituir a chamada direta ao DELETE por um fluxo de dois cliques:

Primeiro clique: mudar o estado do botão para um modo de confirmação, alterando o texto para "Confirmar exclusão?" e a cor para vermelho mais intenso (bg-red-600).
Mostrar junto um botão secundário "Cancelar" que reverte o estado.
Segundo clique no botão de confirmação: executar o DELETE normalmente.


Adicionar um timeout de 5 segundos que reverte automaticamente para o estado inicial caso o usuário não confirme.
Não usar window.confirm() — manter tudo inline no componente.


Restrições gerais

Não quebrar nenhuma rota existente.
Manter o fallback JSON funcionando em todos os fluxos alterados.
Não adicionar novas dependências externas — usar apenas o que já está no projeto.
Manter tipagem TypeScript consistente; evitar any.
Não modificar o visual das páginas públicas além do necessário para SEO.


