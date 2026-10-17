import "dotenv/config"
import { defineConfig, env } from "prisma/config"

// The Prisma CLI (migrate, seed, introspect) resolves against this URL. In
// production it must be the *direct* Prisma Postgres connection
// (`db.prisma.io`) — migrations fail through the pooled host the app uses.
// Locally there is a single database, so we fall back to `DATABASE_URL`.
const datasourceUrl = process.env.DIRECT_URL ? env("DIRECT_URL") : env("DATABASE_URL")

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
		seed: "tsx prisma/seed.ts",
	},
	datasource: {
		url: datasourceUrl,
		// Only used by `prisma migrate dev`; unused by `migrate deploy`.
		shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
	},
})
