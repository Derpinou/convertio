import type { ParamMatcher } from '@sveltejs/kit';
import { findHub } from '$lib/seo/conversions';

/** N'accepte que les pages « Convertir en… » (`convertir-en-jpg`…). */
export const match: ParamMatcher = (param) => findHub(param) !== undefined;
