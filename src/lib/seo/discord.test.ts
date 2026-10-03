import { describe, expect, it } from 'vitest';
import { CONVERSIONS } from './conversions';
import {
	conversionDiscordEmbed,
	DISCORD_EMBED_BUTTONS,
	DISCORD_EMBED_MAX_BYTES,
	DISCORD_EMBED_MAX_COMPONENTS,
	homeDiscordEmbed,
	serializeDiscordEmbed,
	type DiscordEmbed
} from './discord';

type Node = Record<string, unknown> & { type: number };

const ALLOWED_TYPES = new Set([1, 2, 9, 10, 11, 12, 14, 17]);
const BUTTON_KEYS = new Set(['id', 'type', 'url', 'style', 'label', 'emoji', 'disabled']);
const MEDIA_EXTENSIONS = /\.(png|gif|jpe?g|webp|avif|mp4|webm|mov)$/i;

/** Règles de developers/link-previews/component-embeds (documentation Discord). */
function validate(embed: DiscordEmbed): string[] {
	const errors: string[] = [];
	const json = serializeDiscordEmbed(embed);
	const bytes = new TextEncoder().encode(json).length;
	if (bytes > DISCORD_EMBED_MAX_BYTES) errors.push(`${bytes} octets`);
	if (Object.keys(embed).join() !== 'component') errors.push('clé racine autre que component');
	if (embed.component.type !== 17) errors.push('la racine doit être un Container');

	let count = 0;
	let galleryItems = 0;
	const checkUrl = (url: unknown, media = false) => {
		if (typeof url !== 'string' || !/^https?:\/\//.test(url) || url.length > 2048) {
			errors.push(`URL invalide : ${String(url)}`);
		} else if (media && !MEDIA_EXTENSIONS.test(new URL(url).pathname)) {
			errors.push(`format de média non pris en charge : ${url}`);
		}
	};
	const visit = (node: Node, depth: number) => {
		count++;
		if (!ALLOWED_TYPES.has(node.type)) errors.push(`type ${node.type} interdit`);
		if (node.type === 17 && depth > 0) errors.push('Container imbriqué');
		if (node.type === 2) {
			for (const key of Object.keys(node)) {
				if (!BUTTON_KEYS.has(key)) errors.push(`clé de bouton interdite : ${key}`);
			}
			if (node.style !== 5) errors.push('bouton non lien');
			if (!node.label && !node.emoji) errors.push('bouton sans libellé');
			if (typeof node.label === 'string' && node.label.length > 80)
				errors.push('libellé trop long');
			checkUrl(node.url);
		}
		if (node.type === 1 && (node.components as Node[]).length > 5) errors.push('rangée > 5');
		if (node.type === 11) checkUrl((node.media as { url: string }).url, true);
		if (node.type === 12) {
			const items = node.items as { media: { url: string } }[];
			galleryItems += items.length;
			for (const item of items) checkUrl(item.media.url, true);
		}
		for (const child of (node.components as Node[] | undefined) ?? []) visit(child, depth + 1);
		if (node.accessory) visit(node.accessory as Node, depth + 1);
	};
	visit(embed.component as unknown as Node, 0);
	if (count > DISCORD_EMBED_MAX_COMPONENTS) errors.push(`${count} composants`);
	if (galleryItems > 10) errors.push(`${galleryItems} médias`);
	return errors;
}

describe('aperçus Discord', () => {
	it('accueil : valide, avec des boutons de conversion rapide', () => {
		const embed = homeDiscordEmbed();
		expect(validate(embed)).toEqual([]);
		const json = serializeDiscordEmbed(embed);
		expect(json).toContain('"label":"HEIC → JPG"');
		const row = embed.component.components.find((c) => c.type === 1);
		expect(row && 'components' in row ? row.components : []).toHaveLength(DISCORD_EMBED_BUTTONS);
		expect(json).toContain('/heic-en-jpg"');
	});

	it.each(CONVERSIONS.map((c) => [c.slug, c] as const))('%s : valide', (_, conversion) => {
		const embed = conversionDiscordEmbed(conversion);
		expect(validate(embed)).toEqual([]);
		// La rangée de boutons propose d'autres conversions, jamais la page elle-même.
		const row = embed.component.components.find((c) => c.type === 1);
		const urls =
			row && 'components' in row ? row.components.map((b) => ('url' in b ? b.url : '')) : [];
		expect(urls).toHaveLength(DISCORD_EMBED_BUTTONS);
		expect(urls.some((url) => url.endsWith(`/${conversion.slug}`))).toBe(false);
	});

	it('détecte un aperçu invalide', () => {
		const embed = homeDiscordEmbed();
		(embed.component.components as unknown[]).push({
			type: 2,
			style: 1,
			custom_id: 'x',
			label: 'Action'
		});
		expect(validate(embed)).toEqual(
			expect.arrayContaining(['clé de bouton interdite : custom_id', 'bouton non lien'])
		);
	});
});
