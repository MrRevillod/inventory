import { fail } from "@sveltejs/kit"

import { buildCatalog } from "#lib/categories/catalog"
import { productSchema } from "#lib/products/dtos"
import { productsService } from "#lib/products/services"
import { categoriesService } from "#lib/categories/services"
import { categorySchema, subcategorySchema } from "#lib/categories/dtos"

import type { Actions, PageServerLoad } from "./$types"

interface ActionResult {
	action: string
	success: boolean
	errors: Record<string, string[]>
	values: Record<string, string>
}

const ok = (action: string): ActionResult => ({ action, success: true, errors: {}, values: {} })

type ValidationError = { issues: { path: PropertyKey[]; message: string }[] }

function fieldErrors(error: ValidationError): Record<string, string[]> {
	const result: Record<string, string[]> = {}
	for (const issue of error.issues) {
		const key = issue.path.join(".") || "_"
		const messages = result[key]
		if (messages) {
			messages.push(issue.message)
		} else {
			result[key] = [issue.message]
		}
	}
	return result
}

function failWith(action: string, error: ValidationError, values: Record<string, string>) {
	return fail(400, {
		action,
		success: false,
		errors: fieldErrors(error),
		values,
	} satisfies ActionResult)
}

function readCategory(form: FormData): Record<string, string> {
	return { name: String(form.get("name") ?? ""), icon: String(form.get("icon") ?? "") }
}

function readSubcategory(form: FormData): Record<string, string> {
	return {
		name: String(form.get("name") ?? ""),
		icon: String(form.get("icon") ?? ""),
		tone: String(form.get("tone") ?? ""),
		categoryId: String(form.get("categoryId") ?? ""),
	}
}

function readProduct(form: FormData): Record<string, string> {
	return {
		name: String(form.get("name") ?? ""),
		price: String(form.get("price") ?? ""),
		subcategoryId: String(form.get("subcategoryId") ?? ""),
	}
}

export const load: PageServerLoad = async () => {
	const [categories, productsBySubcategory] = await Promise.all([
		categoriesService.list(),
		productsService.listGroupedBySubcategory(),
	])
	return { categories: buildCatalog(categories, productsBySubcategory) }
}

export const actions: Actions = {
	addCategory: async ({ request }) => {
		const values = readCategory(await request.formData())
		const parsed = categorySchema.safeParse(values)
		if (!parsed.success) return failWith("addCategory", parsed.error, values)
		await categoriesService.createCategory(parsed.data)
		return ok("addCategory")
	},

	updateCategory: async ({ request }) => {
		const form = await request.formData()
		const id = String(form.get("id") ?? "")
		const values = readCategory(form)
		const parsed = categorySchema.safeParse(values)
		if (!id || !parsed.success) {
			return parsed.success
				? fail(400, {
						action: "updateCategory",
						success: false,
						errors: { id: ["Falta la categoría"] },
						values,
					} satisfies ActionResult)
				: failWith("updateCategory", parsed.error, values)
		}
		await categoriesService.updateCategory(id, parsed.data)
		return ok("updateCategory")
	},

	deleteCategory: async ({ request }) => {
		const id = String((await request.formData()).get("id") ?? "")
		if (id) await categoriesService.deleteCategory(id)
		return ok("deleteCategory")
	},

	addSubcategory: async ({ request }) => {
		const values = readSubcategory(await request.formData())
		const parsed = subcategorySchema.safeParse(values)
		if (!parsed.success) return failWith("addSubcategory", parsed.error, values)
		await categoriesService.createSubcategory(parsed.data)
		return ok("addSubcategory")
	},

	updateSubcategory: async ({ request }) => {
		const form = await request.formData()
		const id = String(form.get("id") ?? "")
		const values = readSubcategory(form)
		const parsed = subcategorySchema.safeParse(values)
		if (!id || !parsed.success) {
			return parsed.success
				? fail(400, {
						action: "updateSubcategory",
						success: false,
						errors: { id: ["Falta la subcategoría"] },
						values,
					} satisfies ActionResult)
				: failWith("updateSubcategory", parsed.error, values)
		}
		await categoriesService.updateSubcategory(id, parsed.data)
		return ok("updateSubcategory")
	},

	deleteSubcategory: async ({ request }) => {
		const id = String((await request.formData()).get("id") ?? "")
		if (id) await categoriesService.deleteSubcategory(id)
		return ok("deleteSubcategory")
	},

	addProduct: async ({ request }) => {
		const values = readProduct(await request.formData())
		const parsed = productSchema.safeParse(values)
		if (!parsed.success) return failWith("addProduct", parsed.error, values)
		await productsService.create(parsed.data)
		return ok("addProduct")
	},

	updateProduct: async ({ request }) => {
		const form = await request.formData()
		const id = String(form.get("id") ?? "")
		const values = readProduct(form)
		const parsed = productSchema.safeParse(values)
		if (!id || !parsed.success) {
			return parsed.success
				? fail(400, {
						action: "updateProduct",
						success: false,
						errors: { id: ["Falta el producto"] },
						values,
					} satisfies ActionResult)
				: failWith("updateProduct", parsed.error, values)
		}
		await productsService.update(id, parsed.data)
		return ok("updateProduct")
	},

	deleteProduct: async ({ request }) => {
		const id = String((await request.formData()).get("id") ?? "")
		if (id) await productsService.archive(id)
		return ok("deleteProduct")
	},
}
