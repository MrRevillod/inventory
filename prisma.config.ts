import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
		seed: "tsx prisma/seed.ts",
	},
	datasource: {
		// Local dev points at `prisma dev` (see `pnpm db:dev`).
		// In production this is the Prisma Postgres connection string.
		url: env("DATABASE_URL"),
		// Only used by `prisma migrate dev`; unused by `migrate deploy`.
		shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
	},
});
