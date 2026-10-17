import { defineEnvVars } from "@sveltejs/kit/env"

// SvelteKit 3 environment variables. Values are read from `.env` in dev and
// from the platform environment in production. Private by default.
export const variables = defineEnvVars({
	// App runtime connection: the *pooled* Prisma Postgres URL in production
	// (`pooled.db.prisma.io`), the local `prisma dev` URL in development. The
	// CLI uses `DIRECT_URL` instead (see `prisma.config.ts`).
	DATABASE_URL: {},
})
