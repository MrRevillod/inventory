import { resolvePeriod } from "#lib/history/period"
import { historyService } from "#lib/history/services"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ url }) => {
	const resolved = resolvePeriod(url.searchParams.get("period"), url.searchParams.get("month"))
	const sales = await historyService.list(resolved)

	const summary = sales.reduce(
		(acc, sale) => ({ count: acc.count + 1, total: acc.total + sale.total }),
		{ count: 0, total: 0 },
	)

	return {
		sales,
		summary,
		period: resolved.period,
		year: resolved.year,
		month: resolved.month,
	}
}
