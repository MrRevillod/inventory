import { prisma } from "#lib/shared/server/prisma"

import type { ProductInput } from "./dtos"
import type { Prisma, Product } from "#lib/shared/server/generated/prisma/client"

class ProductsService {
	/** Non-archived products grouped by subcategory id, sorted by name. */
	public async listGroupedBySubcategory(): Promise<Record<string, Product[]>> {
		const products = await prisma.product.findMany({
			where: { deletedAt: null },
			orderBy: { name: "asc" },
		})
		const grouped: Record<string, typeof products> = {}
		for (const product of products) {
			const list = grouped[product.subcategoryId]
			if (list) {
				list.push(product)
			} else {
				grouped[product.subcategoryId] = [product]
			}
		}
		return grouped
	}

	public async create(input: ProductInput): Promise<Product> {
		return prisma.product.create({ data: input })
	}

	public async update(id: string, input: ProductInput): Promise<Product> {
		return prisma.product.update({ where: { id }, data: input })
	}

	public async archive(id: string): Promise<Product> {
		return prisma.product.update({ where: { id }, data: { deletedAt: new Date() } })
	}

	public async archiveBySubcategory(subcategoryId: string): Promise<Prisma.BatchPayload> {
		return prisma.product.updateMany({
			where: { subcategoryId },
			data: { deletedAt: new Date() },
		})
	}

	public async archiveByCategory(categoryId: string): Promise<Prisma.BatchPayload> {
		return prisma.product.updateMany({
			where: { subcategory: { categoryId } },
			data: { deletedAt: new Date() },
		})
	}

	/** Products that still exist (not archived) for the given ids. */
	public async findSellable(ids: string[]): Promise<Product[]> {
		return prisma.product.findMany({ where: { id: { in: ids }, deletedAt: null } })
	}
}

export const productsService = new ProductsService()
