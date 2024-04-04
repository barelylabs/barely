'use client';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Img } from '@barely/ui/elements/img';
import { Text } from '@barely/ui/elements/typography';

import type { ProductCtx } from '~/app/[handle]/products/_components/product-context';
import { CreateProductButton } from '~/app/[handle]/products/_components/create-product-button';
import { useProductContext } from '~/app/[handle]/products/_components/product-context';

export function AllProducts() {
	const {
		products,
		productSelection,
		setProductSelection,
		gridListRef,
		setShowUpdateProductModal,
	} = useProductContext();

	return (
		<GridList
			glRef={gridListRef}
			aria-label='Products'
			className='flex flex-col gap-2'
			// behavior
			selectionMode='multiple'
			selectionBehavior='replace'
			// products
			items={products}
			selectedKeys={productSelection}
			setSelectedKeys={setProductSelection}
			onAction={() => {
				if (!productSelection) return;
				setShowUpdateProductModal(true);
			}}
			// empty
			renderEmptyState={() => (
				<NoResultsPlaceholder
					icon='product'
					title='No products found.'
					subtitle='Create a product to get started.'
					button={<CreateProductButton />}
				/>
			)}
		>
			{product => <ProductCard product={product} />}
		</GridList>
	);
}

function ProductCard({
	product,
}: {
	product: NonNullable<ProductCtx['lastSelectedProduct']>;
}) {
	const {
		setShowUpdateProductModal,
		setShowArchiveProductModal,
		setShowDeleteProductModal,
	} = useProductContext();

	return (
		<GridListCard
			id={product.id}
			key={product.id}
			textValue={product.name}
			setShowUpdateModal={setShowUpdateProductModal}
			setShowArchiveModal={setShowArchiveProductModal}
			setShowDeleteModal={setShowDeleteProductModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				<div className='flex flex-col items-start gap-1'>
					<div className='flex flex-row items-center gap-2'>
						<Img
							src={product?.images[0]?.src ?? ''}
							alt='Product Image'
							className='h-8 w-8 rounded-md bg-muted object-cover sm:h-16 sm:w-16'
							width={40}
							height={40}
							sizes='40px'
						/>
						<Text variant='md/semibold' className='text-accent-foreground'>
							{product.name}
						</Text>
					</div>
				</div>
			</div>
		</GridListCard>
	);
}
