import { fail, redirect } from "@sveltejs/kit"

import { authService } from "#lib/auth/services"
import { SESSION_COOKIE } from "#lib/auth/session"
import { changePinSchema } from "#lib/auth/dtos"

import type { Actions } from "./$types"

interface ActionResult {
	action: string
	success: boolean
	errors: Record<string, string[]>
	values: Record<string, string>
}

const failed = (action: string, errors: Record<string, string[]>): ActionResult => ({
	action,
	success: false,
	errors,
	values: {},
})

export const actions: Actions = {
	changePin: async ({ request, cookies }) => {
		const form = await request.formData()
		const parsed = changePinSchema.safeParse({
			current: String(form.get("current") ?? ""),
			next: String(form.get("next") ?? ""),
			confirm: String(form.get("confirm") ?? ""),
		})

		if (!parsed.success) {
			return fail(400, failed("changePin", { pin: ["Cada PIN debe tener 8 dígitos"] }))
		}
		if (parsed.data.next !== parsed.data.confirm) {
			return fail(400, failed("changePin", { confirm: ["Los PIN nuevos no coinciden"] }))
		}
		if (parsed.data.next === parsed.data.current) {
			return fail(400, failed("changePin", { next: ["El PIN nuevo debe ser distinto"] }))
		}

		const changed = await authService.changePin(parsed.data.current, parsed.data.next)
		if (!changed) {
			return fail(400, failed("changePin", { current: ["PIN actual incorrecto"] }))
		}

		// Force a fresh unlock with the new PIN on this device.
		cookies.delete(SESSION_COOKIE, { path: "/" })
		redirect(303, "/unlock")
	},

	logout: async ({ cookies }) => {
		cookies.delete(SESSION_COOKIE, { path: "/" })
		redirect(303, "/unlock")
	},
}
