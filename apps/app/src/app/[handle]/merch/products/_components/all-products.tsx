'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';

import { Badge } from '@barely/ui/badge';
import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';

import { CreateProductButton } from '~/app/[handle]/merch/products/_components/create-product-button';
import {
	useProduct,
	useProductSearchParams,
} from '~/app/[handle]/merch/products/_components/product-context';

export function AllProducts() {
	const { setShowUpdateModal } = useProductSearchParams();
	const { items, selection, setSelection, isFetching } = useProduct();

	return (
		<GridList
			data-grid-list='products'
			aria-label='Products'
			className='flex flex-col gap-2'
			// behavior
			selectionMode='multiple'
			selectionBehavior='replace'
			// products
			items={items}
			selectedKeys={selection}
			setSelectedKeys={setSelection}
			onAction={() => {
				void setShowUpdateModal(true);
			}}
			// empty
			renderEmptyState={() =>
				isFetching ?
					<GridListSkeleton />
				:	<NoResultsPlaceholder
						icon='product'
						title='No products found.'
						subtitle='Create a product to get started.'
						button={<CreateProductButton />}
					/>
			}
		>
			{item => <ProductCard product={item} />}
		</GridList>
	);
}

type ProductItem = AppRouterOutputs['product']['byWorkspace']['products'][0];

function getProductStockStatus(product: ProductItem) {
	if (!product.inventoryEnabled) return 'untracked' as const;

	const totalStock = (product.stock ?? 0) + (product.barelyStock ?? 0);

	// For apparel, sum across all sizes
	const apparelTotal = product._apparelSizes.reduce(
		(sum, s) => sum + (s.stock ?? 0) + (s.barelyStock ?? 0),
		0,
	);

	const effectiveStock = product._apparelSizes.length > 0 ? apparelTotal : totalStock;

	if (effectiveStock <= 0) return 'out' as const;
	if (effectiveStock <= 5) return 'low' as const;
	return 'in' as const;
}

function ProductStockBadge({ product }: { product: ProductItem }) {
	const status = getProductStockStatus(product);

	if (status === 'untracked') return null;

	const config = {
		in: { label: 'In Stock', variant: 'success' as const },
		low: { label: 'Low Stock', variant: 'warning' as const },
		out: { label: 'Sold Out', variant: 'danger' as const },
	};

	const { label, variant } = config[status];

	return (
		<Badge variant={variant} size='sm'>
			{label}
		</Badge>
	);
}

function ProductCard({ product }: { product: ProductItem }) {
	const { setShowUpdateModal, setShowArchiveModal, setShowDeleteModal } =
		useProductSearchParams();

	return (
		<GridListCard
			id={product.id}
			key={product.id}
			textValue={product.name}
			setShowUpdateModal={setShowUpdateModal}
			setShowArchiveModal={setShowArchiveModal}
			setShowDeleteModal={setShowDeleteModal}
			title={product.name}
			img={{ ...product.images[0], alt: `${product.name} product image` }}
		>
			<ProductStockBadge product={product} />
		</GridListCard>
	);
}
