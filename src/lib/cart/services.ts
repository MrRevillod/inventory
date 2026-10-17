import { prisma } from "#lib/shared/server/prisma"
import { productsService } from "#lib/products/services"

import type { Sale, SaleItem } from "#lib/shared/server/generated/prisma/client"
import type { CheckoutInput } from "./dtos"

class CartService {
	/**
	 * Record a sale. Prices and names are read from the database (never trusted
	 * from the client) and snapshotted onto the sale items.
	 */
	public async checkout(items: CheckoutInput["items"]): Promise<Sale & { items: SaleItem[] }> {
		const ids = [...new Set(items.map((item) => item.id))]
		const products = await productsService.findSellable(ids)
		const byId = new Map(products.map((product) => [product.id, product]))

		const saleItems = items.flatMap((item) => {
			const product = byId.get(item.id)
			if (!product) return []
			return [
				{
					productId: product.id,
					name: product.name,
					price: product.price,
					quantity: item.quantity,
				},
			]
		})

		if (saleItems.length === 0) {
			throw new Error("No hay productos válidos en el carrito")
		}

		const total = saleItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

		return prisma.sale.create({
			data: { total, items: { create: saleItems } },
			include: { items: true },
		})
	}
}

export const cartService = new CartService()
