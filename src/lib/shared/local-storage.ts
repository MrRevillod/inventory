import { browser } from "$app/env"

export const STORAGE_KEYS = {
	cart: "pymeapp:cart",
	settings: "pymeapp:settings",
} as const

/** Typed `localStorage` wrapper. No-ops on the server (returns the fallback). */
// biome-ignore lint/complexity/noStaticOnlyClass: static-only utility by design
export class LocalStorage {
	static get<T>(key: string, fallback: T): T {
		if (!browser) return fallback
		try {
			const raw = localStorage.getItem(key)
			return raw ? (JSON.parse(raw) as T) : fallback
		} catch {
			return fallback
		}
	}

	static set(key: string, value: unknown): void {
		if (!browser) return
		localStorage.setItem(key, JSON.stringify(value))
	}

	static remove(key: string): void {
		if (!browser) return
		localStorage.removeItem(key)
	}
}
