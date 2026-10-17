// Lightweight database ping. Point an external uptime monitor at it every few
// minutes: it keeps Prisma Postgres warm so the first real visit doesn't pay
// the (tens of seconds) cold path. Public on purpose — see `hooks.server.ts`.
import { json } from "@sveltejs/kit"

import { prisma } from "#lib/shared/server/prisma"

import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async () => {
	try {
		await prisma.$queryRaw`select 1`
		return json({ ok: true })
	} catch (error) {
		console.error("[health] no se pudo consultar la base:", error)
		return json({ ok: false }, { status: 503 })
	}
}
