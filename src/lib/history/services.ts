import { prisma } from "#lib/shared/server/prisma"

import type { DateRange } from "./dtos"
import type { Sale, SaleItem } from "#lib/shared/server/generated/prisma/client"

class HistoryService {
	/** Sales within a date range (newest first), with their items. */
	public async list(range: DateRange): Promise<(Sale & { items: SaleItem[] })[]> {
		return prisma.sale.findMany({
			where: {
				createdAt: range.to ? { gte: range.from, lt: range.to } : { gte: range.from },
			},
			orderBy: { createdAt: "desc" },
			include: { items: true },
		})
	}
}

export const historyService = new HistoryService()
