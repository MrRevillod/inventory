import { fail, redirect } from "@sveltejs/kit"

import { pinSchema } from "#lib/auth/dtos"
import { createSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "#lib/auth/session"
import { authService } from "#lib/auth/services"

import type { AuthStatus, UnlockResult } from "#lib/auth/services"
import type { Actions, PageServerLoad } from "./$types"

interface Rejection {
	action: "unlock"
	success: boolean
	errors: Record<string, string[]>
	values: Record<string, string>
}

const rejected = (status: number, message: string) =>
	fail(status, {
		action: "unlock",
		success: false,
		errors: { pin: [message] },
		values: {},
	} satisfies Rejection)

const DB_DOWN = "No se pudo conectar con la base de datos"

/** Only local paths are valid post-unlock destinations. */
function safeRedirect(target: string | null): string {
	if (!target?.startsWith("/") || target.startsWith("//")) return "/"
	return target
}

export const load: PageServerLoad = async () => {
	try {
		const status = await authService.status()
		return {
			configured: status.configured,
			lockedUntil: status.lockedUntil?.getTime() ?? null,
			dbError: false,
		}
	} catch (error) {
		// Cold starts on Prisma Postgres can hang for a while; surface that
		// instead of a bare 500 so the user knows to retry.
		console.error("[unlock] no se pudo consultar la base:", error)
		return { configured: false, lockedUntil: null, dbError: true }
	}
}

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData()

		let status: AuthStatus
		try {
			status = await authService.status()
		} catch (error) {
			console.error("[unlock] no se pudo consultar la base:", error)
			return rejected(503, DB_DOWN)
		}

		if (!status.configured) return rejected(503, "La app todavía no tiene un PIN configurado")
		if (status.lockedUntil) return rejected(429, "Demasiados intentos, espera unos minutos")

		const parsed = pinSchema.safeParse(String(form.get("pin") ?? ""))
		if (!parsed.success) return rejected(400, "El PIN debe tener 8 dígitos")

		let result: UnlockResult
		try {
			result = await authService.verify(parsed.data)
		} catch (error) {
			console.error("[unlock] no se pudo verificar el PIN:", error)
			return rejected(503, DB_DOWN)
		}

		if (result === "invalid") return rejected(400, "PIN incorrecto")
		if (result === "locked") return rejected(429, "Demasiados intentos, espera unos minutos")
		if (result !== "ok") return rejected(503, "La app todavía no tiene un PIN configurado")

		cookies.set(SESSION_COOKIE, createSession(), SESSION_COOKIE_OPTIONS)
		redirect(303, safeRedirect(url.searchParams.get("redirectTo")))
	},
}
