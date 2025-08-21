import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { productSearchParamsSchema } from '@barely/validators';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllProducts } from '~/app/[handle]/products/_components/all-products';
import { ArchiveOrDeleteProductModal } from '~/app/[handle]/products/_components/archive-or-delete-product-modal';
import { CreateOrUpdateProductModal } from '~/app/[handle]/products/_components/create-or-update-product-modal';
import { CreateProductButton } from '~/app/[handle]/products/_components/create-product-button';
import { ProductFilters } from '~/app/[handle]/products/_components/product-filters';
import { ProductHotkeys } from '~/app/[handle]/products/_components/product-hotkeys';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

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
		console.log(parsedFilters.error.flatten().fieldErrors);
		redirect(`/${awaitedParams.handle}/products`);
	}

	// Prefetch data (not async - don't await)
	prefetch(
		trpc.product.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Products' button={<CreateProductButton />} />
			<DashContent>
				<ProductFilters />
				<Suspense fallback={<div>Loading...</div>}>
					<AllProducts />

					<CreateOrUpdateProductModal mode='create' />
					<CreateOrUpdateProductModal mode='update' />

					<ArchiveOrDeleteProductModal mode='archive' />
					<ArchiveOrDeleteProductModal mode='delete' />

					<ProductHotkeys />
					{/* <UpgradeModal checkoutCancelPath="products" checkoutSuccessPath="products" /> */}
				</Suspense>
			</DashContent>
		</HydrateClient>
	);
}
