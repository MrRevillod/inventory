import { prisma } from "#lib/shared/server/prisma"
import { APP_CONFIG_ID, hashPin, lockExpiry, MAX_ATTEMPTS, newSalt, verifyPin } from "./pin"

import type { AppConfig } from "#lib/shared/server/generated/prisma/client"

/** Outcome of an unlock attempt. */
export type UnlockResult = "ok" | "invalid" | "locked" | "unconfigured"

export interface AuthStatus {
	configured: boolean
	/** When the gate unlocks again, or `null` if it isn't locked. */
	lockedUntil: Date | null
}

class AuthService {
	public async status(): Promise<AuthStatus> {
		const config = await this.read()
		return { configured: config !== null, lockedUntil: lockExpiry(config?.lockedAt ?? null) }
	}

	public async verify(pin: string): Promise<UnlockResult> {
		const config = await this.read()
		if (!config) return "unconfigured"
		if (lockExpiry(config.lockedAt)) return "locked"

		if (await verifyPin(pin, config.pinSalt, config.pinHash)) {
			await this.reset()
			return "ok"
		}

		await this.registerFailure(config)
		return "invalid"
	}

	/** Verifies the current PIN, then replaces it. */
	public async changePin(current: string, next: string): Promise<boolean> {
		const config = await this.read()
		if (!config) return false
		if (lockExpiry(config.lockedAt)) return false

		if (!(await verifyPin(current, config.pinSalt, config.pinHash))) {
			await this.registerFailure(config)
			return false
		}

		await this.write(next)
		return true
	}

	/** Replaces the PIN without asking for the current one (CLI bootstrap). */
	public async setPin(pin: string): Promise<void> {
		await this.write(pin)
	}

	private async read(): Promise<AppConfig | null> {
		return prisma.appConfig.findUnique({ where: { id: APP_CONFIG_ID } })
	}

	private async write(pin: string): Promise<void> {
		const pinSalt = newSalt()
		const pinHash = await hashPin(pin, pinSalt)

		await prisma.appConfig.upsert({
			where: { id: APP_CONFIG_ID },
			create: { id: APP_CONFIG_ID, pinSalt, pinHash },
			update: { pinSalt, pinHash, attempts: 0, lockedAt: null },
		})
	}

	private async reset(): Promise<void> {
		await prisma.appConfig.update({
			where: { id: APP_CONFIG_ID },
			data: { attempts: 0, lockedAt: null },
		})
	}

	private async registerFailure(config: AppConfig): Promise<void> {
		const attempts = config.attempts + 1
		const locked = attempts >= MAX_ATTEMPTS

		await prisma.appConfig.update({
			where: { id: APP_CONFIG_ID },
			data: { attempts: locked ? 0 : attempts, lockedAt: locked ? new Date() : null },
		})
	}
}

export const authService = new AuthService()
