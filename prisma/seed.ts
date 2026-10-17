// Seed data ported from legacy/lib/db.ts (nail-salon services and products),
// organized as Category -> Subcategory -> Product.
// Run with `pnpm db:seed` against a migrated database.
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/lib/shared/server/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const categories = [
	{ id: "cat-products", name: "Productos", icon: "shopping-bag", position: 0 },
	{ id: "cat-services", name: "Servicios", icon: "sparkles", position: 1 },
]

const subcategories = [
	// Productos
	{
		id: "products-polish",
		name: "Esmaltes",
		icon: "droplet",
		tone: 0,
		position: 0,
		categoryId: "cat-products",
	},
	{
		id: "products-glitter",
		name: "Brillos y Glitter",
		icon: "sparkles",
		tone: 1,
		position: 1,
		categoryId: "cat-products",
	},
	{
		id: "products-fake-nails",
		name: "Uñas postizas (producto)",
		icon: "gem",
		tone: 2,
		position: 2,
		categoryId: "cat-products",
	},
	{
		id: "products-tools",
		name: "Limas y Herramientas",
		icon: "hammer",
		tone: 3,
		position: 3,
		categoryId: "cat-products",
	},
	{
		id: "products-gel-acrylic",
		name: "Geles y Acrílicos",
		icon: "droplet",
		tone: 4,
		position: 4,
		categoryId: "cat-products",
	},
	{
		id: "products-decorations",
		name: "Decoraciones",
		icon: "flower",
		tone: 5,
		position: 5,
		categoryId: "cat-products",
	},
	// Servicios
	{
		id: "services-applications",
		name: "Aplicaciones",
		icon: "paintbrush",
		tone: 6,
		position: 0,
		categoryId: "cat-services",
	},
	{
		id: "services-custom-designs",
		name: "Diseños personalizados",
		icon: "wand-sparkles",
		tone: 7,
		position: 1,
		categoryId: "cat-services",
	},
	{
		id: "services-fake-nails",
		name: "Uñas postizas (servicio)",
		icon: "gem",
		tone: 2,
		position: 2,
		categoryId: "cat-services",
	},
	{
		id: "services-nail-art",
		name: "Nail Art",
		icon: "palette",
		tone: 3,
		position: 3,
		categoryId: "cat-services",
	},
	{
		id: "services-refill",
		name: "Refill (Relleno)",
		icon: "brush",
		tone: 4,
		position: 4,
		categoryId: "cat-services",
	},
	{
		id: "services-removal",
		name: "Retiro de uñas",
		icon: "scissors",
		tone: 5,
		position: 5,
		categoryId: "cat-services",
	},
]

const products = [
	{
		id: "srv-001",
		name: "Aplicación básica semipermanente",
		price: 8000,
		subcategoryId: "services-applications",
	},
	{
		id: "srv-002",
		name: "Aplicación gel UV",
		price: 10000,
		subcategoryId: "services-applications",
	},
	{
		id: "srv-003",
		name: "Diseño personalizado",
		price: 2500,
		subcategoryId: "services-custom-designs",
	},
	{
		id: "srv-004",
		name: "Uñas postizas con tip",
		price: 9000,
		subcategoryId: "services-fake-nails",
	},
	{ id: "srv-005", name: "Refill gel/acrílico", price: 7000, subcategoryId: "services-refill" },
	{ id: "srv-006", name: "Retiro de uñas", price: 3000, subcategoryId: "services-removal" },
	{ id: "prd-001", name: "Esmalte rojo intenso", price: 2500, subcategoryId: "products-polish" },
	{ id: "prd-002", name: "Esmalte nude rosado", price: 2500, subcategoryId: "products-polish" },
	{ id: "prd-003", name: "Brillo holográfico", price: 1800, subcategoryId: "products-glitter" },
	{ id: "prd-004", name: "Brillo dorado fino", price: 1800, subcategoryId: "products-glitter" },
	{
		id: "prd-005",
		name: "Set de uñas postizas almendra",
		price: 3500,
		subcategoryId: "products-fake-nails",
	},
	{
		id: "prd-006",
		name: "Lima profesional 180/100",
		price: 1200,
		subcategoryId: "products-tools",
	},
	{
		id: "prd-007",
		name: "Gel constructor transparente",
		price: 4500,
		subcategoryId: "products-gel-acrylic",
	},
	{
		id: "prd-008",
		name: "Decoraciones florales 3D",
		price: 2200,
		subcategoryId: "products-decorations",
	},
]

async function main() {
	for (const category of categories) {
		await prisma.category.upsert({
			where: { id: category.id },
			update: {
				name: category.name,
				icon: category.icon,
				position: category.position,
				deletedAt: null,
			},
			create: category,
		})
	}

	for (const subcategory of subcategories) {
		await prisma.subcategory.upsert({
			where: { id: subcategory.id },
			update: {
				name: subcategory.name,
				icon: subcategory.icon,
				tone: subcategory.tone,
				position: subcategory.position,
				categoryId: subcategory.categoryId,
				deletedAt: null,
			},
			create: subcategory,
		})
	}

	for (const product of products) {
		await prisma.product.upsert({
			where: { id: product.id },
			update: {
				name: product.name,
				price: product.price,
				subcategoryId: product.subcategoryId,
				deletedAt: null,
			},
			create: product,
		})
	}

	console.log(
		`Seeded ${categories.length} categories, ${subcategories.length} subcategories and ${products.length} products.`,
	)
}

main()
	.then(() => prisma.$disconnect())
	.catch(async (error) => {
		console.error(error)
		await prisma.$disconnect()
		process.exit(1)
	})
