import { z } from "zod";

export const categorySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "El nombre de la categoría es requerido")
		.max(60, "Máximo 60 caracteres"),
	icon: z.string().trim().min(1).catch("sparkles"),
});

export const subcategorySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "El nombre de la subcategoría es requerido")
		.max(60, "Máximo 60 caracteres"),
	icon: z.string().trim().min(1).catch("sparkles"),
	tone: z.coerce.number().int().min(0).max(7).catch(0),
	categoryId: z.string().min(1, "La categoría es requerida"),
});

export const productSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "El nombre del producto es requerido")
		.max(100, "Máximo 100 caracteres"),
	price: z.coerce
		.number()
		.int("El precio debe ser un entero")
		.min(1, "El precio debe ser mayor a 0"),
	subcategoryId: z.string().min(1, "La subcategoría es requerida"),
});

export const checkoutSchema = z.object({
	items: z
		.array(
			z.object({
				id: z.string().min(1),
				quantity: z.coerce.number().int().min(1),
			}),
		)
		.min(1, "El carrito está vacío"),
});
