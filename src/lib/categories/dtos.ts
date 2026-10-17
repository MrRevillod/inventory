import * as z from "zod/mini"

export const categorySchema = z.object({
	name: z
		.string()
		.check(
			z.trim(),
			z.minLength(1, "El nombre de la categoría es requerido"),
			z.maxLength(60, "Máximo 60 caracteres"),
		),
	icon: z.catch(z.string().check(z.trim(), z.minLength(1)), "sparkles"),
})

export const subcategorySchema = z.object({
	name: z
		.string()
		.check(
			z.trim(),
			z.minLength(1, "El nombre de la subcategoría es requerido"),
			z.maxLength(60, "Máximo 60 caracteres"),
		),
	icon: z.catch(z.string().check(z.trim(), z.minLength(1)), "sparkles"),
	tone: z.catch(
		z.coerce.number().check(z.minimum(0), z.maximum(7), z.refine(Number.isInteger)),
		0,
	),
	categoryId: z.string().check(z.minLength(1, "La categoría es requerida")),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type SubcategoryInput = z.infer<typeof subcategorySchema>
