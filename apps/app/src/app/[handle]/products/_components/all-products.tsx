'use client';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';

import type { ProductContext } from '~/app/[handle]/products/_components/product-context';
import { CreateProductButton } from '~/app/[handle]/products/_components/create-product-button';
import { useProductContext } from '~/app/[handle]/products/_components/product-context';

export function AllProducts() {
	const { items, selection, setSelection, gridListRef, setShowUpdateModal, isFetching } =
		useProductContext();

	return (
		<GridList
			glRef={gridListRef}
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
				if (!selection) return;
				setShowUpdateModal(true);
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

function ProductCard({
	product,
}: {
	product: NonNullable<ProductContext['lastSelectedItem']>;
}) {
	const { setShowUpdateModal, setShowArchiveModal, setShowDeleteModal } =
		useProductContext();

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
			{/* <div className='flex flex-grow flex-row items-center gap-4'>
				<div className='flex flex-col items-start gap-1'>
					<div className='flex flex-row items-center gap-2'>
						<Img
							{...(s3Key ? { s3Key } : { src: '/images/product-placeholder.png' })}
							{...(blurDataUrl ? { blurDataUrl } : {})}
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
			</div> */}
		</GridListCard>
	);
}
