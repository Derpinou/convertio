export type ToastKind = 'success' | 'info' | 'error';

export interface Toast {
	id: number;
	kind: ToastKind;
	title: string;
	message?: string;
	action?: { label: string; run: () => void };
	/** Durée d'affichage en ms ; `0` = jusqu'à fermeture manuelle. */
	duration: number;
}

class Toasts {
	items = $state<Toast[]>([]);
	#next = 1;

	push(toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }): number {
		const id = this.#next++;
		const duration = toast.duration ?? (toast.action ? 0 : 6000);
		this.items.push({ ...toast, id, duration });
		if (duration > 0) setTimeout(() => this.dismiss(id), duration);
		return id;
	}

	dismiss(id: number) {
		this.items = this.items.filter((toast) => toast.id !== id);
	}
}

export const toasts = new Toasts();
