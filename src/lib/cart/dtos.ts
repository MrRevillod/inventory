import * as z from "zod/mini"

import type { CatalogProduct } from "#lib/products/dtos"

export const checkoutSchema = z.object({
	items: z
		.array(
			z.object({
				id: z.string().check(z.minLength(1)),
				quantity: z.coerce.number().check(z.minimum(1), z.refine(Number.isInteger)),
			}),
		)
		.check(z.minLength(1, "El carrito está vacío")),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
export type CartItem = CatalogProduct & { quantity: number }

/** One line of a sale, as recorded in the database. */
export interface ReceiptItem {
	name: string
	price: number
	quantity: number
}

/** Server payload for a completed sale, used to render the receipt. */
export interface Receipt {
	items: ReceiptItem[]
	total: number
	createdAt: string
}

/** Everything the receipt image needs. */
export type ReceiptData = Receipt & {
	storeName: string
	accent: string
}
