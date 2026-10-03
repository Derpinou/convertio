/**
 * Aperçu de lien Discord personnalisé (« component embed ») : remplace la carte Open Graph par
 * une mise en page en composants Discord, avec des boutons de conversion rapide.
 * Spécification : https://github.com/discord/discord-api-docs (developers/link-previews).
 * Les balises Open Graph restent le repli quand l'aperçu ne peut pas être affiché.
 */
import { absoluteUrl, OG_IMAGE, SITE_NAME } from '$lib/site';
import {
	CONVERSIONS,
	conversionTitle,
	findConversion,
	sourceName,
	targetName,
	type Conversion
} from './conversions';

/** Indigo 600 de l'interface. */
const ACCENT_COLOR = 0x4f46e5;

/** Taille maximale du JSON, échappements compris. */
export const DISCORD_EMBED_MAX_BYTES = 3000;
export const DISCORD_EMBED_MAX_COMPONENTS = 40;

/** Nombre de boutons de conversion par aperçu. */
export const DISCORD_EMBED_BUTTONS = 3;

/** Conversions les plus demandées, par ordre de priorité (boutons de l'accueil, puis complément). */
const QUICK_CONVERSIONS = ['heic-en-jpg', 'webp-en-jpg', 'png-en-webp', 'svg-en-png', 'png-en-ico'];

export interface LinkButton {
	type: 2;
	style: 5;
	url: string;
	label: string;
}

interface MediaItem {
	url: string;
}

export type DiscordComponent =
	| { type: 1; components: LinkButton[] }
	| LinkButton
	| { type: 9; components: DiscordComponent[]; accessory: DiscordComponent }
	| { type: 10; content: string }
	| { type: 11; media: MediaItem; description?: string }
	| { type: 12; items: { media: MediaItem; description?: string }[] }
	| { type: 14; spacing?: 1 | 2; divider?: boolean }
	| { type: 17; accent_color?: number; components: DiscordComponent[] };

export interface DiscordEmbed {
	component: { type: 17; accent_color?: number; components: DiscordComponent[] };
}

const conversionButton = (conversion: Conversion): LinkButton => ({
	type: 2,
	style: 5,
	url: absoluteUrl(`/${conversion.slug}`),
	label: `${sourceName(conversion)} → ${targetName(conversion)}`
});

const banner = (): DiscordComponent => ({
	type: 12,
	items: [{ media: { url: absoluteUrl(OG_IMAGE.path) }, description: OG_IMAGE.alt }]
});

const footnote: DiscordComponent = {
	type: 10,
	content: '-# ✅ 100 % gratuit · Sans pub · Sans inscription · 🔒 Fichiers jamais envoyés'
};

export function homeDiscordEmbed(): DiscordEmbed {
	const quick = QUICK_CONVERSIONS.map((slug) => findConversion(slug)).filter(
		(conversion): conversion is Conversion => conversion !== undefined
	);
	return {
		component: {
			type: 17,
			accent_color: ACCENT_COLOR,
			components: [
				{
					type: 9,
					components: [
						{
							type: 10,
							content: `## [${SITE_NAME}](${absoluteUrl('/')})\nConvertisseur d’images **gratuit et sans pub** : HEIC, PNG, JPG, WebP, AVIF, SVG… directement dans votre navigateur, sans inscription.`
						}
					],
					accessory: { type: 11, media: { url: absoluteUrl('/pwa-192x192.png') } }
				},
				banner(),
				{ type: 10, content: '**Conversions rapides**' },
				{ type: 1, components: quick.slice(0, DISCORD_EMBED_BUTTONS).map(conversionButton) },
				footnote
			]
		}
	};
}

/** Conversions associées (même format source ou cible), complétées par les plus demandées. */
function buttonConversions(conversion: Conversion, count = DISCORD_EMBED_BUTTONS): Conversion[] {
	const related = CONVERSIONS.filter(
		(other) =>
			other.slug !== conversion.slug &&
			(other.from === conversion.from || other.to === conversion.to)
	);
	for (const slug of QUICK_CONVERSIONS) {
		const other = findConversion(slug);
		if (other && other.slug !== conversion.slug && !related.includes(other)) related.push(other);
	}
	return related.slice(0, count);
}

export function conversionDiscordEmbed(conversion: Conversion): DiscordEmbed {
	const url = absoluteUrl(`/${conversion.slug}`);
	return {
		component: {
			type: 17,
			accent_color: ACCENT_COLOR,
			components: [
				{
					type: 9,
					components: [
						{
							type: 10,
							content: `## [Convertir ${conversionTitle(conversion)}](${url})\n${conversion.note}`
						}
					],
					accessory: { type: 2, style: 5, url, label: 'Convertir' }
				},
				banner(),
				{ type: 10, content: '**Autres conversions**' },
				{ type: 1, components: buttonConversions(conversion).map(conversionButton) },
				footnote
			]
		}
	};
}

/**
 * JSON du `<script>` : seul `<` est échappé (impossible de fermer la balise). Les échappements
 * comptent dans la limite de taille, d'où ce choix minimal.
 */
export function serializeDiscordEmbed(embed: DiscordEmbed): string {
	return JSON.stringify(embed).replace(/</g, '\\u003c');
}
