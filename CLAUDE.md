# Convertio

Convertisseur d’images 100 % côté client (aucun serveur), SvelteKit statique déployé sur
Cloudflare Pages, PWA. Voir README.md pour l’architecture.

## Commandes

- `pnpm dev` · `pnpm build` · `pnpm preview` (port 4173, service worker actif)
- `pnpm check` (svelte-check) · `pnpm lint` / `pnpm format` (Prettier + tri des classes Tailwind)
- `pnpm test:unit` (Vitest, `src/**/*.test.ts`) · `pnpm test:e2e` (Playwright sur le build de prod)

Avant de rendre la main : `pnpm format && pnpm check && pnpm test:unit`, et `pnpm test:e2e` si le
moteur de conversion, le service worker ou l’interface ont changé.

## Conventions

- Textes d’interface, commentaires et messages d’erreur en français.
- Svelte 5 en runes ; état partagé dans `src/lib/state/*.svelte.ts`. Passer `$state.snapshot(...)`
  avant d’envoyer un objet réactif au worker (les proxys ne sont pas clonables).
- Style Tailwind Plus (Tailwind v4, palette `gray`/`indigo`, variantes `dark:`). Comportements
  interactifs (dialogues…) via `@tailwindplus/elements`, chargé côté client dans `+layout.svelte`.
- Aucune requête vers un domaine tiers : la CSP (`svelte.config.js`) l’interdit. Les polices sont
  auto-hébergées.
- Un format = une entrée dans `src/lib/formats.ts`, un décodeur WASM éventuel dans
  `convert/decode.ts`, un encodeur dans `convert/encode.ts`, un test aller-retour dans `tests/`.
- SEO : chaque page passe par `<Seo>` (titre, description, canonique, Open Graph, JSON-LD).
  Les pages de conversion viennent du catalogue `src/lib/seo/conversions.ts` (texte propre à
  chaque couple dans `note`) ; les URL absolues dépendent de `VITE_SITE_URL`. Accorder les
  articles avec `withArticle` (« l’AVIF », « le JPG »).
- Images : modifier `assets/og-image.html` puis lancer `pnpm generate-assets` (bannière + captures
  PWA, recompressées avec OxiPNG) plutôt que d’éditer les PNG.

## Pièges connus

- SvelteKit reste en 2.x : `@vite-pwa/sveltekit` ne prend pas encore en charge la 3. TypeScript
  reste en 6.x (svelte-check ne gère pas la 7).
- Les paquets `@jsquash/*` doivent rester dans `optimizeDeps.exclude` (chemins `.wasm` relatifs).
- Les codecs multithread créent des workers imbriqués ; `convert/threading.ts` bascule en
  monothread quand c’est impossible (Electron, WebViews), sinon l’initialisation bloque.
- libheif s’initialise de façon synchrone avec `wasmBinary` (voir `decoders/heic.ts`).
- Le navigateur intégré de l’app Claude ne peut pas lancer `pnpm dev` (permission macOS sur
  Documents) : démarrer le serveur depuis le terminal puis ouvrir http://localhost:5173.
