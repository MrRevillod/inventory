export type ToastType = "success" | "error" | "info";

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
}

class ToastStore {
	items = $state<Toast[]>([]);
	#next = 1;

	show(message: string, type: ToastType = "info") {
		const id = this.#next++;
		this.items = [...this.items, { id, message, type }];
		setTimeout(() => this.dismiss(id), 2600);
	}

	dismiss(id: number) {
		this.items = this.items.filter((toast) => toast.id !== id);
	}
}

export const toasts = new ToastStore();
