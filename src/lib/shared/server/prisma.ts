// Server-only Prisma client. Never import this from client code; keep it
// behind the `src/lib/server` boundary.

import { dev } from "$app/env"
import { PrismaPg } from "@prisma/adapter-pg"
import { DATABASE_URL } from "$app/env/private"

import { PrismaClient } from "./generated/prisma/client"

const adapter = new PrismaPg({
	connectionString: DATABASE_URL,
	// No `query_timeout`: Prisma Postgres can take tens of seconds to answer the
	// first query after idle, and killing it turned cold starts into 500s.
	// Vercel's function budget is the real bound. `connectionTimeoutMillis`
	// only guards against a genuinely unreachable host.
	connectionTimeoutMillis: 30_000,
})

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Reuse the client across hot reloads in dev to avoid exhausting connections.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (dev) globalForPrisma.prisma = prisma
