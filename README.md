# Convertio

![Convertio — Convertissez vos images sans les envoyer nulle part](static/og-image.png)

Convertisseur de formats d’image **100 % local** : la conversion se fait directement dans le
navigateur, aucun fichier n’est envoyé sur un serveur. Installable en PWA, Convertio fonctionne
aussi hors ligne.

## Fonctionnalités

| Formats lus                                                         | Formats produits                                    |
| ------------------------------------------------------------------- | --------------------------------------------------- |
| HEIC/HEIF, JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF, BMP, ICO, JPEG XL | JPEG, PNG, WebP, AVIF, GIF, ICO, BMP, TIFF, JPEG XL |

- Glisser-déposer, sélecteur de fichiers, collage (Ctrl+V), conversion par lots, archive ZIP.
- Réglages par format : qualité, mode sans perte, couleur de fond (formats sans transparence),
  compression PNG maximale, tailles d’un fichier ICO, taille de rendu des SVG. Ils sont mémorisés.
- Orientation EXIF appliquée ; métadonnées (EXIF, GPS) supprimées.
- PWA : installation, mode hors ligne, « Partager vers Convertio » (Android) et « Ouvrir avec
  Convertio » (Chrome/Edge sur ordinateur), partage du résultat via la feuille de partage du système.
- SEO : une page prérendue par conversion courante (`/heic-en-jpg`, `/png-en-webp`…), avec texte
  dédié, FAQ, données structurées, sitemap et bannière de partage.

Limites connues : seule la première image des animations est conservée, les couleurs sont converties
en sRGB, le TIFF produit n’est pas compressé.

## Fonctionnement

```
Interface (SvelteKit + Svelte 5)
   │  fichiers + réglages
   ▼
Pool de Web Workers (Comlink)
   ├─ décodage natif du navigateur (createImageBitmap + OffscreenCanvas)
   │  └─ sinon WebAssembly : jSquash (JPEG, PNG, WebP, AVIF, JPEG XL), libheif (HEIC), UTIF (TIFF)
   ├─ pixels RGBA (fond uni ajouté si le format cible n’a pas de transparence)
   └─ encodage : jSquash (MozJPEG, OxiPNG, libwebp, libavif, libjxl), gifenc, BMP/ICO maison
   ▼
Blob téléchargeable + vignette
```

- Le SVG est rastérisé dans le thread principal (le rendu SVG a besoin du DOM).
- Les codecs sont chargés à la demande. Le service worker précache l’interface ; chaque `.wasm` est
  mis en cache à sa première utilisation. « Rendre disponible hors ligne » (pied de page) télécharge
  tous les codecs ; c’est automatique quand l’application est installée.
- L’isolation cross-origin (en-têtes COOP/COEP) active les codecs multithread (AVIF, JPEG XL,
  OxiPNG). Si le navigateur ne permet pas les workers imbriqués, les versions monothread sont utilisées.
- La politique de sécurité (CSP) interdit toute requête vers un autre domaine.

```
src/
├── lib/
│   ├── convert/        moteur : worker, décodeurs, encodeurs, détection de format
│   ├── components/     interface (Tailwind Plus)
│   ├── state/          file de conversion, réglages, PWA, notifications
│   ├── seo/            catalogue des conversions, textes, données structurées
│   └── formats.ts      registre des formats
├── routes/             accueil, pages de conversion, sitemap.xml, robots.txt
└── service-worker.ts   cache hors ligne, Web Share Target
assets/                 source de la bannière de partage, photos d'exemple
scripts/                génération des images (bannière, captures PWA)
static/_headers         en-têtes Cloudflare (COOP/COEP, sécurité, cache)
tests/                  tests Playwright (+ images de test)
```

## Développement

Prérequis : Node.js ≥ 22 et pnpm 11.

```bash
pnpm install
```

```bash
pnpm dev
```

| Commande                    | Rôle                                                     |
| --------------------------- | -------------------------------------------------------- |
| `pnpm dev`                  | serveur de développement (http://localhost:5173)         |
| `pnpm build`                | build statique dans `build/`                             |
| `pnpm preview`              | sert le build (service worker et en-têtes compris)       |
| `pnpm check`                | vérification TypeScript / Svelte                         |
| `pnpm lint` / `pnpm format` | vérification / application du formatage Prettier         |
| `pnpm test:unit`            | tests unitaires (Vitest)                                 |
| `pnpm test:e2e`             | tests de bout en bout sur Chromium, Firefox et WebKit    |
| `pnpm generate-pwa-assets`  | régénère les icônes PWA à partir de `static/favicon.svg` |
| `pnpm generate-assets`      | régénère la bannière de partage et les captures PWA      |

Les tests de bout en bout nécessitent les navigateurs Playwright (`pnpm exec playwright install`).
Le service worker n’est actif qu’avec `pnpm build && pnpm preview`, pas en mode `dev`.

## SEO et images

- **URL du site** : les URL canoniques, Open Graph, le sitemap et le robots.txt utilisent la
  variable d’environnement `VITE_SITE_URL` (ex. `https://convertio.example.com`), lue au build.
- **Pages de conversion** : le catalogue est dans `src/lib/seo/conversions.ts`. Ajouter une entrée
  crée la page, l’ajoute au sitemap et au pied de page.
- **Bannière de partage** (`static/og-image.png`, 1200 × 630) : sa source est
  `assets/og-image.html`. `pnpm generate-assets` la rend avec Playwright, puis capture
  l’application (`static/screenshots/`) pour la fenêtre d’installation de la PWA.

## Déploiement sur Cloudflare

Le site est entièrement statique : il est publié comme un Worker sans code serveur
(Workers Static Assets), configuré dans `wrangler.toml`. Le fichier `static/_headers` (copié dans
`build/`) pose les en-têtes nécessaires ; les URL inconnues renvoient `404.html` avec un statut 404.

**Intégration Git (recommandé)** - dans le tableau de bord Cloudflare : _Workers & Pages → Créer →
Importer un dépôt_, puis dans _Settings → Build_ :

- commande de build : `pnpm build`
- commande de déploiement : `npx wrangler deploy` (valeur par défaut)
- répertoire racine : vide
- variables de build : `NODE_VERSION=22`, `PNPM_VERSION=11.20.0` et `VITE_SITE_URL` (URL publique
  du site)

Le nom du Worker doit correspondre au champ `name` de `wrangler.toml` (`convertio`).

**En ligne de commande** :

```bash
pnpm exec wrangler login
```

```bash
VITE_SITE_URL=https://convertio.example.com pnpm deploy:cf
```

Pour le sous-domaine : _Workers & Pages → convertio → Settings → Domains & Routes → Add →
Custom domain_.

## Licences

Le code de Convertio est distribué sous licence [Apache 2.0](LICENSE).

- **Tailwind Plus Elements** (`@tailwindplus/elements`) est sous licence commerciale : un fork de ce
  projet nécessite sa propre licence [Tailwind Plus](https://tailwindcss.com/plus).
- **libheif / libheif-js** (décodage HEIC) : LGPL-3.0. La bibliothèque est chargée comme module
  WebAssembly séparé et peut être remplacée.
- jSquash, Comlink : Apache-2.0 · UTIF.js, gifenc, client-zip, Workbox, Heroicons : MIT ·
  police Inter : OFL-1.1.
