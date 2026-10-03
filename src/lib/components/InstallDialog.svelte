<script lang="ts">
	import Dialog from './Dialog.svelte';
	import Icon from './Icon.svelte';
</script>

<Dialog
	id="install-dialog"
	title="Installer Convertio sur l’iPhone ou l’iPad"
	icon="device-phone-mobile"
>
	<p>Ajoutez Convertio à votre écran d’accueil pour l’ouvrir comme une app, même hors ligne :</p>
	<ol class="mt-4 space-y-3 text-left">
		<li class="flex items-center gap-x-3">
			<span
				class="flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-white/10"
			>
				<Icon name="arrow-up-on-square" class="size-5 text-indigo-600 dark:text-indigo-400" />
			</span>
			<span>Touchez <strong class="font-semibold">Partager</strong> dans la barre de Safari.</span>
		</li>
		<li class="flex items-center gap-x-3">
			<span
				class="flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-white/10"
			>
				<Icon name="squares-plus" class="size-5 text-indigo-600 dark:text-indigo-400" />
			</span>
			<span>Choisissez <strong class="font-semibold">Sur l’écran d’accueil</strong>.</span>
		</li>
		<li class="flex items-center gap-x-3">
			<span
				class="flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-sm font-semibold text-indigo-600 dark:bg-white/10 dark:text-indigo-400"
			>
				OK
			</span>
			<span>Validez avec <strong class="font-semibold">Ajouter</strong>.</span>
		</li>
	</ol>
</Dialog>
