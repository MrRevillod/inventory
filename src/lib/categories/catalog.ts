import type { productsService } from "#lib/products/services"
import type { categoriesService } from "./services"

export type CategoryWithSubcategories = Awaited<ReturnType<typeof categoriesService.list>>[number]

type ProductRecord = Awaited<
	ReturnType<typeof productsService.listGroupedBySubcategory>
>[string][number]

/**
 * Composes the navigation tree (categories -> subcategories -> products) from
 * the categories and products modules, keeping their responsibilities separate.
 */
export function buildCatalog(
	categories: CategoryWithSubcategories[],
	productsBySubcategory: Record<string, ProductRecord[]>,
) {
	return categories.map((category) => ({
		...category,
		subcategories: category.subcategories.map((subcategory) => ({
			...subcategory,
			products: productsBySubcategory[subcategory.id] ?? [],
		})),
	}))
}
