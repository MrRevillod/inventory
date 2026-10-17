import * as z from "zod/mini"

export const dateRangeSchema = z.object({
	from: z.date(),
	to: z.nullable(z.date()),
})

export type DateRange = z.infer<typeof dateRangeSchema>
