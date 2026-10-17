import { prisma } from "#lib/shared/server/prisma"
import { productsService } from "#lib/products/services"

import type { Category, Subcategory } from "#lib/shared/server/generated/prisma/client"
import type { CategoryInput, SubcategoryInput } from "./dtos"

class CategoriesService {
	public async list(): Promise<(Category & { subcategories: Subcategory[] })[]> {
		return prisma.category.findMany({
			where: { deletedAt: null },
			orderBy: { position: "asc" },
			include: {
				subcategories: {
					where: { deletedAt: null },
					orderBy: { position: "asc" },
				},
			},
		})
	}

	public async createCategory(input: CategoryInput): Promise<Category> {
		const last = await prisma.category.aggregate({ _max: { position: true } })
		return prisma.category.create({
			data: { ...input, position: (last._max.position ?? -1) + 1 },
		})
	}

	public async updateCategory(id: string, input: CategoryInput): Promise<Category> {
		return prisma.category.update({ where: { id }, data: input })
	}

	/** Soft-delete a category and its subcategories (products are archived by the products service). */
	public async deleteCategory(id: string): Promise<void> {
		const now = new Date()

		await prisma.$transaction([
			prisma.subcategory.updateMany({ where: { categoryId: id }, data: { deletedAt: now } }),
			prisma.category.update({ where: { id }, data: { deletedAt: now } }),
		])

		await productsService.archiveByCategory(id)
	}

	public async createSubcategory(input: SubcategoryInput): Promise<Subcategory> {
		const last = await prisma.subcategory.aggregate({
			where: { categoryId: input.categoryId },
			_max: { position: true },
		})

		return prisma.subcategory.create({
			data: { ...input, position: (last._max.position ?? -1) + 1 },
		})
	}

	public async updateSubcategory(id: string, input: SubcategoryInput): Promise<Subcategory> {
		return prisma.subcategory.update({ where: { id }, data: input })
	}

	/** Soft-delete a subcategory (products are archived by the products service). */
	public async deleteSubcategory(id: string): Promise<void> {
		await prisma.subcategory.update({ where: { id }, data: { deletedAt: new Date() } })
		await productsService.archiveBySubcategory(id)
	}
}

export const categoriesService = new CategoriesService()
