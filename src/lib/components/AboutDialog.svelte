<script lang="ts">
	import { FORMATS, INPUT_FORMATS, OUTPUT_FORMATS } from '$lib/formats';
	import { REPOSITORY_URL } from '$lib/site';
	import Dialog from './Dialog.svelte';

	const list = (ids: typeof INPUT_FORMATS) => ids.map((id) => FORMATS[id].label).join(', ');
</script>

<Dialog id="about-dialog" title="À propos de Convertio" icon="shield-check">
	<div class="space-y-3">
		<p>
			Convertio convertit vos images <strong class="font-semibold text-gray-900 dark:text-white"
				>directement dans votre navigateur</strong
			>. Aucun fichier n’est envoyé sur un serveur : tout reste sur votre appareil, même sans
			connexion une fois l’application chargée.
		</p>
		<dl class="space-y-2">
			<div>
				<dt class="font-medium text-gray-900 dark:text-white">Formats lus</dt>
				<dd>{list(INPUT_FORMATS)}</dd>
			</div>
			<div>
				<dt class="font-medium text-gray-900 dark:text-white">Formats produits</dt>
				<dd>{list(OUTPUT_FORMATS)}</dd>
			</div>
			<div>
				<dt class="font-medium text-gray-900 dark:text-white">Bon à savoir</dt>
				<dd>
					Les métadonnées (EXIF, GPS) sont supprimées, les couleurs sont converties en sRGB et seule
					la première image des animations est conservée.
				</dd>
			</div>
		</dl>
		<p>
			Projet libre et gratuit,
			<a
				href={REPOSITORY_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
				>code source sur GitHub</a
			>.
		</p>
	</div>
</Dialog>
