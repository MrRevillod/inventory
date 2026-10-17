import Gem from "@lucide/svelte/icons/gem"
import Tag from "@lucide/svelte/icons/tag"
import Hand from "@lucide/svelte/icons/hand"
import Leaf from "@lucide/svelte/icons/leaf"
import Star from "@lucide/svelte/icons/star"
import Brush from "@lucide/svelte/icons/brush"
import Crown from "@lucide/svelte/icons/crown"
import Heart from "@lucide/svelte/icons/heart"
import Flower from "@lucide/svelte/icons/flower"
import Hammer from "@lucide/svelte/icons/hammer"
import Droplet from "@lucide/svelte/icons/droplet"
import Package from "@lucide/svelte/icons/package"
import Palette from "@lucide/svelte/icons/palette"
import Scissors from "@lucide/svelte/icons/scissors"
import Sparkles from "@lucide/svelte/icons/sparkles"
import Paintbrush from "@lucide/svelte/icons/paintbrush"
import WandSparkles from "@lucide/svelte/icons/wand-sparkles"

export const categoryIcons = {
	sparkles: Sparkles,
	paintbrush: Paintbrush,
	palette: Palette,
	brush: Brush,
	gem: Gem,
	scissors: Scissors,
	droplet: Droplet,
	"wand-sparkles": WandSparkles,
	flower: Flower,
	hammer: Hammer,
	package: Package,
	tag: Tag,
	star: Star,
	heart: Heart,
	leaf: Leaf,
	crown: Crown,
	hand: Hand,
}

export type CategoryIconName = keyof typeof categoryIcons

export const categoryIconNames = Object.keys(categoryIcons) as CategoryIconName[]

export const DEFAULT_ICON: CategoryIconName = "sparkles"

export function getCategoryIcon(name: string) {
	return categoryIcons[name as CategoryIconName] ?? categoryIcons[DEFAULT_ICON]
}
