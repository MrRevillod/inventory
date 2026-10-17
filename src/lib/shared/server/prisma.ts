// Server-only Prisma client. Never import this from client code; keep it
// behind the `src/lib/server` boundary.

import { dev } from "$app/env"
import { PrismaPg } from "@prisma/adapter-pg"
import { DATABASE_URL } from "$app/env/private"

import { PrismaClient } from "./generated/prisma/client"

const adapter = new PrismaPg({
	connectionString: DATABASE_URL,
	// Fail fast instead of hanging a request when the pooler is slow or stuck.
	connectionTimeoutMillis: 10_000,
	statement_timeout: 15_000,
})

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Reuse the client across hot reloads in dev to avoid exhausting connections.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (dev) globalForPrisma.prisma = prisma
