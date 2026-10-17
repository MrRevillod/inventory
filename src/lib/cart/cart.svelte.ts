import { LocalStorage, STORAGE_KEYS } from "#lib/shared/local-storage"

import type { CartItem } from "./dtos"
import type { CatalogProduct } from "#lib/products/dtos"

/** Client-side cart. Persisted to localStorage so it survives reloads. */
class Cart {
	items = $state<CartItem[]>([])

	readonly total = $derived(this.items.reduce((sum, item) => sum + item.price * item.quantity, 0))
	readonly count = $derived(this.items.reduce((sum, item) => sum + item.quantity, 0))

	#hydrated = false

	/** Load persisted items. Call once, from an effect, to avoid SSR mismatch. */
	hydrate() {
		if (this.#hydrated) return
		this.#hydrated = true
		this.items = LocalStorage.get<CartItem[]>(STORAGE_KEYS.cart, [])
	}

	add(product: CatalogProduct) {
		const existing = this.items.find((item) => item.id === product.id)
		if (existing) existing.quantity += 1
		else this.items.push({ ...product, quantity: 1 })
		this.#persist()
	}

	decrement(id: string) {
		const index = this.items.findIndex((item) => item.id === id)
		if (index === -1) return
		const item = this.items[index]
		if (item.quantity <= 1) this.items.splice(index, 1)
		else item.quantity -= 1
		this.#persist()
	}

	remove(id: string) {
		this.items = this.items.filter((item) => item.id !== id)
		this.#persist()
	}

	clear() {
		this.items = []
		this.#persist()
	}

	#persist() {
		LocalStorage.set(STORAGE_KEYS.cart, this.items)
	}
}

export const cart = new Cart()
