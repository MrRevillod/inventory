import * as z from "zod/mini"
import { defineEnvVars } from "@sveltejs/kit/env"

// SvelteKit 3 environment variables. Values are read from `.env` in dev and
// from the platform environment in production. Private by default.
export const variables = defineEnvVars({
	// App runtime connection: the *pooled* Prisma Postgres URL in production
	// (`pooled.db.prisma.io`), the local `prisma dev` URL in development. The
	// CLI uses `DIRECT_URL` instead (see `prisma.config.ts`).
	DATABASE_URL: {},
	// Signs the unlock session cookie (`src/lib/auth/session.ts`). Generate with
	// `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
	// Required: an empty secret breaks every request in the auth hook.
	SESSION_SECRET: {
		schema: z
			.string()
			.check(z.minLength(32, "SESSION_SECRET debe tener al menos 32 caracteres")),
	},
})
