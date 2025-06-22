import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { productSearchParamsSchema } from '@barely/lib/server/routes/product/product.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllProducts } from '~/app/[handle]/products/_components/all-products';
import { ArchiveOrDeleteProductModal } from '~/app/[handle]/products/_components/archive-or-delete-product-modal';
import { CreateOrUpdateProductModal } from '~/app/[handle]/products/_components/create-or-update-product-modal';
import { CreateProductButton } from '~/app/[handle]/products/_components/create-product-button';
import { ProductContextProvider } from '~/app/[handle]/products/_components/product-context';
import { ProductFilters } from '~/app/[handle]/products/_components/product-filters';
import { ProductHotkeys } from '~/app/[handle]/products/_components/product-hotkeys';

export default async function ProductsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof productSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = productSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		console.log(parsedFilters.error.errors);
		redirect(`/${awaitedParams.handle}/products`);
	}

	const products = api({ handle: awaitedParams.handle }).product.byWorkspace({
		handle: awaitedParams.handle,
		...parsedFilters.data,
	});

	return (
		<ProductContextProvider initialInfiniteProducts={products}>
			<DashContentHeader title='Products' button={<CreateProductButton />} />

			<ProductFilters />
			<AllProducts />

			<CreateOrUpdateProductModal mode='create' />
			<CreateOrUpdateProductModal mode='update' />

			<ArchiveOrDeleteProductModal mode='archive' />
			<ArchiveOrDeleteProductModal mode='delete' />

			<ProductHotkeys />
			{/* <UpgradeModal checkoutCancelPath="products" checkoutSuccessPath="products" /> */}
		</ProductContextProvider>
	);
}
