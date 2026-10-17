import { prisma } from "./prisma"

/**
 * Record a sale. Prices and names are read from the database (never trusted
 * from the client) and snapshotted onto the sale items.
 */
export async function createSale(items: { id: string; quantity: number }[]) {
	const ids = [...new Set(items.map((item) => item.id))]
	const products = await prisma.product.findMany({
		where: { id: { in: ids }, deletedAt: null },
	})
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

/** Sales within a date range (newest first), with their items. */
export function listSales(range: { from: Date; to: Date | null }) {
	return prisma.sale.findMany({
		where: {
			createdAt: range.to ? { gte: range.from, lt: range.to } : { gte: range.from },
		},
		orderBy: { createdAt: "desc" },
		include: { items: true },
	})
}
