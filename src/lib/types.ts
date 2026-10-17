export interface CatalogProduct {
	id: string;
	name: string;
	price: number;
	subcategoryId: string;
}

export interface CartItem extends CatalogProduct {
	quantity: number;
}
