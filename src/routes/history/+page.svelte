<script lang="ts">
	import History from "@lucide/svelte/icons/history"
	import Receipt from "@lucide/svelte/icons/receipt"
	import Calendar from "@lucide/svelte/icons/calendar"
	import ChevronLeft from "@lucide/svelte/icons/chevron-left"
	import ChevronRight from "@lucide/svelte/icons/chevron-right"

	import SaleCard from "#lib/history/components/SaleCard.svelte"
	import PageHeader from "#lib/shared/components/PageHeader.svelte"

	import { Money } from "#lib/shared/value-objects/money.value"
	import { dayHeading, dayKey, monthKey, monthLabel, monthNav, PERIODS } from "#lib/history/period"

	import type { PageProps } from "./$types"

	let { data }: PageProps = $props()

	let openId = $state<string | null>(null)

	const toggle = (id: string) => {
		openId = openId === id ? null : id
	}

	const prev = $derived(monthNav(data.year, data.month, -1))
	const next = $derived(monthNav(data.year, data.month, 1))

	const groups = $derived.by(() => {
		const map = new Map<
			string,
			{ key: string; heading: string; total: number; count: number; sales: typeof data.sales }
		>()
		for (const sale of data.sales) {
			const key = dayKey(sale.createdAt)
			let group = map.get(key)
			if (!group) {
				group = { key, heading: dayHeading(sale.createdAt), total: 0, count: 0, sales: [] }
				map.set(key, group)
			}
			group.total += sale.total
			group.count += 1
			group.sales.push(sale)
		}
		return [...map.values()]
	})
</script>

<PageHeader title="Historial" subtitle="Ventas registradas" icon={History} />

<div class="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none]">
	{#each PERIODS as option (option.key)}
		<a
			href={option.key === "month"
				? `?period=month&month=${monthKey(data.year, data.month)}`
				: `?period=${option.key}`}
			class="shrink-0 rounded-pill px-3.5 py-2 text-sm font-semibold transition-colors {data.period ===
			option.key
				? "bg-primary-600 text-white shadow-sm"
				: "bg-white text-neutral-600 ring-1 ring-neutral-200"}"
		>
			{option.label}
		</a>
	{/each}
</div>

{#if data.period === "month"}
	<div class="flex items-center justify-between px-5 pb-3">
		<a
			href={`?period=month&month=${monthKey(prev.year, prev.month)}`}
			aria-label="Mes anterior"
			class="flex size-9 items-center justify-center rounded-pill bg-white text-neutral-500 ring-1 ring-neutral-200 transition-transform active:scale-90"
		>
			<ChevronLeft size={18} />
		</a>
		<span class="flex items-center gap-1.5 text-sm font-bold">
			<Calendar size={15} class="text-primary-600" />
			{monthLabel(data.year, data.month)}
		</span>
		<a
			href={`?period=month&month=${monthKey(next.year, next.month)}`}
			aria-label="Mes siguiente"
			class="flex size-9 items-center justify-center rounded-pill bg-white text-neutral-500 ring-1 ring-neutral-200 transition-transform active:scale-90"
		>
			<ChevronRight size={18} />
		</a>
	</div>
{/if}

<div class="px-5 pb-3">
	<div
		class="flex items-center justify-between rounded-3xl bg-primary-600 px-5 py-4 text-white shadow-lg shadow-primary-600/25"
	>
		<div>
			<p class="text-xs opacity-80">Total del período</p>
			<p class="text-2xl font-extrabold tabular-nums">{Money.format(data.summary.total)}</p>
		</div>
		<div class="text-right">
			<p class="text-xs opacity-80">Ventas</p>
			<p class="text-2xl font-extrabold tabular-nums">{data.summary.count}</p>
		</div>
	</div>
</div>

<div class="space-y-7 px-5 pt-1 pb-28">
	{#each groups as group (group.key)}
		<section>
			<div class="mb-2 flex items-center justify-between gap-2 px-1">
				<h2 class="truncate text-sm font-bold">{group.heading}</h2>
				<span class="shrink-0 text-xs font-medium text-neutral-400 tabular-nums">
					{group.count}
					· {Money.format(group.total)}
				</span>
			</div>
			<div class="space-y-3">
				{#each group.sales as sale (sale.id)}
					<SaleCard {sale} open={openId === sale.id} ontoggle={() => toggle(sale.id)} />
				{/each}
			</div>
		</section>
	{:else}
		<div
			class="flex flex-col items-center gap-2 rounded-3xl bg-white py-16 text-center ring-1 ring-neutral-200/70"
		>
			<Receipt size={30} class="text-neutral-300" />
			<p class="text-sm text-neutral-500">No hay ventas en este período.</p>
			<a href="/" class="text-sm font-semibold text-primary-600">Ir a vender</a>
		</div>
	{/each}
</div>
