export const SITE_NAME = 'Convertio';

export const REPOSITORY_URL = 'https://github.com/Derpinou/convertio';

/**
 * URL publique du site, sans « / » final : utilisée pour les URL canoniques, Open Graph et le
 * sitemap. À définir au build via la variable d'environnement `VITE_SITE_URL`.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://convertio.pages.dev').replace(
	/\/+$/,
	''
);

/** Bannière affichée lors du partage d'un lien (Open Graph / Twitter). */
export const OG_IMAGE = {
	path: '/og-image.png',
	width: 1200,
	height: 630,
	alt: 'Convertio — Convertissez vos images sans les envoyer nulle part'
};

/** `/heic-en-jpg` → `https://…/heic-en-jpg` ; `/` → `https://…/` */
export const absoluteUrl = (path: string) =>
	`${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
