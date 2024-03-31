import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { productSearchParamsSchema } from '@barely/lib/server/routes/product/product.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllProducts } from '~/app/[handle]/products/_components/all-products';
import { ArchiveOrDeleteProductModal } from '~/app/[handle]/products/_components/archive-or-delete-product-modal';
import { CreateOrUpdateProductModal } from '~/app/[handle]/products/_components/create-or-update-product-modal';
import { CreateProductButton } from '~/app/[handle]/products/_components/create-product-button';
import { ProductContextProvider } from '~/app/[handle]/products/_components/product-context';

export default function ProductsPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof productSearchParamsSchema>;
}) {
	const parsedFilters = productSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		console.log(parsedFilters.error.errors);
		redirect(`/${params.handle}/products`);
	}

	const { selectedProductIds, ...filters } = parsedFilters.data;

	const products = api({ handle: params.handle }).product.byWorkspace({
		handle: params.handle,
		...filters,
	});

	return (
		<ProductContextProvider
			initialProducts={products}
			filters={filters}
			selectedProductIds={selectedProductIds ?? []}
		>
			<DashContentHeader title='Products' button={<CreateProductButton />} />

			<AllProducts />

			<CreateOrUpdateProductModal mode='create' />
			<CreateOrUpdateProductModal mode='update' />

			<ArchiveOrDeleteProductModal mode='archive' />
			<ArchiveOrDeleteProductModal mode='delete' />

			{/* <ProductHotkeys /> */}
			{/* <UpgradeModal checkoutCancelPath="products" checkoutSuccessPath="products" /> */}
		</ProductContextProvider>
	);
}
