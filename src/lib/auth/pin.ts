// PIN domain rules. Deliberately free of `$app/*` and Prisma imports so the
// `pnpm pin:set` CLI can reuse the exact same hashing and lockout policy.

import { promisify } from "node:util"
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"

/** The `AppConfig` row is a singleton. */
export const APP_CONFIG_ID = "app"

/** Failed unlocks allowed before the gate locks. */
export const MAX_ATTEMPTS = 5

/** How long the gate stays locked after too many attempts. */
export const LOCK_MS = 5 * 60 * 1000

const KEY_LENGTH = 32

const derive = promisify(scrypt) as (pin: string, salt: string, length: number) => Promise<Buffer>

/** Fresh salt for a new PIN hash. */
export function newSalt(): string {
	return randomBytes(16).toString("hex")
}

/** scrypt hash of a PIN. */
export async function hashPin(pin: string, salt: string): Promise<string> {
	return (await derive(pin, salt, KEY_LENGTH)).toString("hex")
}

/** Constant-time check of a PIN against a stored salt + hash. */
export async function verifyPin(pin: string, salt: string, hash: string): Promise<boolean> {
	const candidate = Buffer.from(await hashPin(pin, salt), "hex")
	const expected = Buffer.from(hash, "hex")
	return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

/** When the gate unlocks again, or `null` if it isn't locked. */
export function lockExpiry(lockedAt: Date | null): Date | null {
	if (!lockedAt) return null
	const until = lockedAt.getTime() + LOCK_MS
	return until > Date.now() ? new Date(until) : null
}
