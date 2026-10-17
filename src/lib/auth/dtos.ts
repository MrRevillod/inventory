import * as z from "zod/mini"

export const pinSchema = z
	.string()
	.check(z.regex(/^[0-9]{8}$/, "El PIN debe tener exactamente 8 dígitos"))

export const changePinSchema = z.object({
	current: pinSchema,
	next: pinSchema,
	confirm: pinSchema,
})

export type ChangePinInput = z.infer<typeof changePinSchema>
