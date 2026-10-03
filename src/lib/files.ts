import { dedupeNames } from '$lib/formats';

export function saveBlob(blob: Blob, name: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = name;
	link.rel = 'noopener';
	document.body.append(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function saveAsZip(files: { name: string; blob: Blob }[]): Promise<void> {
	const { downloadZip } = await import('client-zip');
	const names = dedupeNames(files.map((file) => file.name));
	const now = new Date();
	const zip = await downloadZip(
		files.map((file, i) => ({ name: names[i], input: file.blob, lastModified: now }))
	).blob();
	const stamp = now.toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
	saveBlob(zip, `convertio-${stamp}.zip`);
}

export function canShareFiles(files: File[]): boolean {
	try {
		return typeof navigator !== 'undefined' && !!navigator.canShare?.({ files });
	} catch {
		return false;
	}
}

/** Partage via la feuille de partage du système (iOS, Android, macOS…). */
export async function shareFiles(files: File[]): Promise<void> {
	try {
		await navigator.share({ files });
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') return;
		throw error;
	}
}

/** Cache où le service worker dépose les fichiers reçus via « Partager vers Convertio ». */
export const SHARE_CACHE = 'convertio-share-target';

export async function takeSharedFiles(): Promise<File[]> {
	if (!('caches' in globalThis) || !(await caches.has(SHARE_CACHE))) return [];
	const cache = await caches.open(SHARE_CACHE);
	const requests = await cache.keys();
	const files: File[] = [];
	for (const request of requests) {
		const response = await cache.match(request);
		if (response) {
			const blob = await response.blob();
			const name = decodeURIComponent(response.headers.get('x-file-name') ?? 'image');
			files.push(new File([blob], name, { type: blob.type }));
		}
		await cache.delete(request);
	}
	await caches.delete(SHARE_CACHE);
	return files;
}
