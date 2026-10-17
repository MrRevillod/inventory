import { fail } from "@sveltejs/kit"
import { listCatalog } from "#lib/server/catalog"
import { createSale } from "#lib/server/sales"
import { checkoutSchema } from "#lib/validation"
import type { Actions, PageServerLoad } from "./$types"

interface CheckoutResult {
	action: "checkout"
	success: boolean
	errors: Record<string, string[]>
	total: number
}

export const load: PageServerLoad = async () => {
	return { categories: await listCatalog() }
}

export const actions: Actions = {
	checkout: async ({ request }) => {
		const form = await request.formData()

		let items: unknown
		try {
			items = JSON.parse(String(form.get("cart") ?? "[]"))
		} catch {
			return fail(400, {
				action: "checkout",
				success: false,
				errors: { cart: ["El carrito enviado no es válido"] },
				total: 0,
			} satisfies CheckoutResult)
		}

		const parsed = checkoutSchema.safeParse({ items })
		if (!parsed.success) {
			return fail(400, {
				action: "checkout",
				success: false,
				errors: { cart: parsed.error.issues.map((issue) => issue.message) },
				total: 0,
			} satisfies CheckoutResult)
		}

		try {
			const sale = await createSale(parsed.data.items)
			return {
				action: "checkout",
				success: true,
				errors: {},
				total: sale.total,
			} satisfies CheckoutResult
		} catch {
			return fail(400, {
				action: "checkout",
				success: false,
				errors: { cart: ["Algunos productos ya no están disponibles"] },
				total: 0,
			} satisfies CheckoutResult)
		}
	},
}
