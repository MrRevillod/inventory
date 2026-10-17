import { prisma } from "./prisma"

/** Categories with their subcategories and products, in display order. Hides soft-deleted rows. */
export function listCatalog() {
	return prisma.category.findMany({
		where: { deletedAt: null },
		orderBy: { position: "asc" },
		include: {
			subcategories: {
				where: { deletedAt: null },
				orderBy: { position: "asc" },
				include: { products: { where: { deletedAt: null }, orderBy: { name: "asc" } } },
			},
		},
	})
}

// Categories ---------------------------------------------------------------

export async function createCategory(input: { name: string; icon: string }) {
	const last = await prisma.category.aggregate({ _max: { position: true } })
	return prisma.category.create({
		data: { ...input, position: (last._max.position ?? -1) + 1 },
	})
}

export function updateCategory(id: string, input: { name: string; icon: string }) {
	return prisma.category.update({ where: { id }, data: input })
}

/** Soft-delete a category, its subcategories and their products. */
export async function deleteCategory(id: string) {
	const now = new Date()
	await prisma.$transaction([
		prisma.product.updateMany({
			where: { subcategory: { categoryId: id } },
			data: { deletedAt: now },
		}),
		prisma.subcategory.updateMany({ where: { categoryId: id }, data: { deletedAt: now } }),
		prisma.category.update({ where: { id }, data: { deletedAt: now } }),
	])
}

// Subcategories ------------------------------------------------------------

export async function createSubcategory(input: {
	name: string
	icon: string
	tone: number
	categoryId: string
}) {
	const last = await prisma.subcategory.aggregate({
		where: { categoryId: input.categoryId },
		_max: { position: true },
	})
	return prisma.subcategory.create({
		data: { ...input, position: (last._max.position ?? -1) + 1 },
	})
}

export function updateSubcategory(
	id: string,
	input: { name: string; icon: string; tone: number; categoryId: string },
) {
	return prisma.subcategory.update({ where: { id }, data: input })
}

/** Soft-delete a subcategory and its products. */
export async function deleteSubcategory(id: string) {
	const now = new Date()
	await prisma.$transaction([
		prisma.product.updateMany({ where: { subcategoryId: id }, data: { deletedAt: now } }),
		prisma.subcategory.update({ where: { id }, data: { deletedAt: now } }),
	])
}

// Products -----------------------------------------------------------------

export function createProduct(input: { name: string; price: number; subcategoryId: string }) {
	return prisma.product.create({ data: input })
}

export function updateProduct(
	id: string,
	input: { name: string; price: number; subcategoryId: string },
) {
	return prisma.product.update({ where: { id }, data: input })
}

/** Soft-delete a product. */
export function deleteProduct(id: string) {
	return prisma.product.update({ where: { id }, data: { deletedAt: new Date() } })
}
