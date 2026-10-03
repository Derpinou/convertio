import { error } from '@sveltejs/kit';
import { findHub, HUB_FORMATS, hubSlug } from '$lib/seo/conversions';
import type { EntryGenerator, PageLoad } from './$types';

/** Une page prérendue par format de sortie. */
export const entries: EntryGenerator = () =>
	HUB_FORMATS.map((format) => ({ hub: hubSlug(format) }));

export const load: PageLoad = ({ params }) => {
	const format = findHub(params.hub);
	if (!format) error(404, 'Format inconnu');
	return { format };
};
