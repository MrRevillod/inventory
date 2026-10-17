import { fail } from "@sveltejs/kit"

import { cartService } from "#lib/cart/services"
import { buildCatalog } from "#lib/categories/catalog"
import { checkoutSchema } from "#lib/cart/dtos"
import { productsService } from "#lib/products/services"
import { categoriesService } from "#lib/categories/services"

import type { ReceiptItem } from "#lib/cart/dtos"
import type { Actions, PageServerLoad } from "./$types"

interface CheckoutResult {
	action: "checkout"
	success: boolean
	errors: Record<string, string[]>
	total: number
	/** The sale as recorded, so the receipt matches the database. */
	items: ReceiptItem[]
	createdAt: string | null
}

const rejected = (errors: Record<string, string[]>): CheckoutResult => ({
	action: "checkout",
	success: false,
	errors,
	total: 0,
	items: [],
	createdAt: null,
})

export const load: PageServerLoad = async () => {
	const [categories, productsBySubcategory] = await Promise.all([
		categoriesService.list(),
		productsService.listGroupedBySubcategory(),
	])
	return { categories: buildCatalog(categories, productsBySubcategory) }
}

export const actions: Actions = {
	checkout: async ({ request }) => {
		const form = await request.formData()

		let items: unknown
		try {
			items = JSON.parse(String(form.get("cart") ?? "[]"))
		} catch {
			return fail(400, rejected({ cart: ["El carrito enviado no es válido"] }))
		}

		const parsed = checkoutSchema.safeParse({ items })
		if (!parsed.success) {
			return fail(400, rejected({ cart: parsed.error.issues.map((issue) => issue.message) }))
		}

		try {
			const sale = await cartService.checkout(parsed.data.items)
			return {
				action: "checkout",
				success: true,
				errors: {},
				total: sale.total,
				items: sale.items.map((item) => ({
					name: item.name,
					price: item.price,
					quantity: item.quantity,
				})),
				createdAt: sale.createdAt.toISOString(),
			} satisfies CheckoutResult
		} catch {
			return fail(400, rejected({ cart: ["Algunos productos ya no están disponibles"] }))
		}
	},
}
