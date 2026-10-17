import * as z from "zod/mini"

export const productSchema = z.object({
	name: z
		.string()
		.check(
			z.trim(),
			z.minLength(1, "El nombre del producto es requerido"),
			z.maxLength(100, "Máximo 100 caracteres"),
		),
	price: z.coerce
		.number()
		.check(
			z.minimum(1, "El precio debe ser mayor a 0"),
			z.refine(Number.isInteger, "El precio debe ser un entero"),
		),
	subcategoryId: z.string().check(z.minLength(1, "La subcategoría es requerida")),
})

export type ProductInput = z.infer<typeof productSchema>

/** Product shape used by the client (cart, POS). */
export interface CatalogProduct {
	id: string
	name: string
	price: number
	subcategoryId: string
}
