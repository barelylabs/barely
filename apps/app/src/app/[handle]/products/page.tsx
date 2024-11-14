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
import { ProductFilters } from '~/app/[handle]/products/_components/product-filters';
import { ProductHotkeys } from '~/app/[handle]/products/_components/product-hotkeys';

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

	const products = api({ handle: params.handle }).product.byWorkspace({
		handle: params.handle,
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
