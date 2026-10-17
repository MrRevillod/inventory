import { browser } from "$app/env"
import type { CartItem, CatalogProduct } from "./types"

const STORAGE_KEY = "pymeapp:cart"

function read(): CartItem[] {
	if (!browser) return []
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		return raw ? (JSON.parse(raw) as CartItem[]) : []
	} catch {
		return []
	}
}

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
		this.items = read()
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
		if (!browser) return
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
	}
}

export const cart = new Cart()
