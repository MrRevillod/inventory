import { dev } from "$app/env"
import { SESSION_SECRET } from "$app/env/private"
import { createHmac, timingSafeEqual } from "node:crypto"

export const SESSION_COOKIE = "inventory_unlock"

const VERSION = "v1"
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export const SESSION_COOKIE_OPTIONS = {
	path: "/",
	httpOnly: true,
	sameSite: "lax",
	secure: !dev,
	maxAge: MAX_AGE,
} as const

function sign(payload: string): string {
	return createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url")
}

/** Signed value for a fresh unlock session. */
export function createSession(): string {
	const payload = `${VERSION}.${Date.now() + MAX_AGE * 1000}`
	return `${payload}.${sign(payload)}`
}

/** True when the cookie is well formed, unexpired and correctly signed. */
export function isValidSession(value: string | undefined): boolean {
	if (!value) return false

	const [version, expires, mac] = value.split(".")
	if (version !== VERSION || !expires || !mac) return false

	const given = Buffer.from(mac)
	const expected = Buffer.from(sign(`${version}.${expires}`))
	if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false

	return Number(expires) > Date.now()
}
