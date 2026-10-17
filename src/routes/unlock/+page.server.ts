import { fail, redirect } from "@sveltejs/kit"

import { pinSchema } from "#lib/auth/dtos"
import { authService } from "#lib/auth/services"
import { createSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "#lib/auth/session"

import type { Actions, PageServerLoad } from "./$types"

interface UnlockResult {
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
	} satisfies UnlockResult)

/** Only local paths are valid post-unlock destinations. */
function safeRedirect(target: string | null): string {
	if (!target?.startsWith("/") || target.startsWith("//")) return "/"
	return target
}

export const load: PageServerLoad = async () => {
	const status = await authService.status()
	return {
		configured: status.configured,
		lockedUntil: status.lockedUntil?.getTime() ?? null,
	}
}

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData()
		const status = await authService.status()

		if (!status.configured) return rejected(503, "La app todavía no tiene un PIN configurado")
		if (status.lockedUntil) return rejected(429, "Demasiados intentos, espera unos minutos")

		const parsed = pinSchema.safeParse(String(form.get("pin") ?? ""))
		if (!parsed.success) return rejected(400, "El PIN debe tener 8 dígitos")

		const result = await authService.verify(parsed.data)
		if (result === "invalid") return rejected(400, "PIN incorrecto")
		if (result === "locked") return rejected(429, "Demasiados intentos, espera unos minutos")
		if (result !== "ok") return rejected(503, "La app todavía no tiene un PIN configurado")

		cookies.set(SESSION_COOKIE, createSession(), SESSION_COOKIE_OPTIONS)
		redirect(303, safeRedirect(url.searchParams.get("redirectTo")))
	},
}
