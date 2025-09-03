'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';
import { formatMinorToMajorCurrency, getAbsoluteUrl } from '@barely/utils';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';

import { CreateLandingPageButton } from '~/app/[handle]/pages/_components/create-landing-page-button';
import {
	useLandingPage,
	useLandingPageSearchParams,
} from '~/app/[handle]/pages/_components/landing-page-context';

export function AllLandingPages() {
	const router = useRouter();
	const { handle } = useWorkspace();

	const { items, selection, setSelection, isFetching, lastSelectedItemId } =
		useLandingPage();

	return (
		<GridList
			data-grid-list='landing-pages'
			aria-label='Landing Pages'
			className='flex flex-col gap-2'
			selectionMode='multiple'
			selectionBehavior='replace'
			items={items}
			selectedKeys={selection}
			setSelectedKeys={setSelection}
			onAction={() => {
				if (!lastSelectedItemId) return;
				router.push(`/${handle}/pages/${lastSelectedItemId}`);
			}}
			renderEmptyState={() =>
				isFetching ?
					<GridListSkeleton />
				:	<NoResultsPlaceholder
						icon='landingPage'
						title='No landing pages found.'
						subtitle='Create your first landing page to get started.'
						button={<CreateLandingPageButton />}
					/>
			}
		>
			{item => <LandingPageCard landingPage={item} />}
		</GridList>
	);
}

function LandingPageCard({
	landingPage,
}: {
	landingPage: AppRouterOutputs['landingPage']['byWorkspace']['landingPages'][0];
}) {
	const { setShowArchiveModal, setShowDeleteModal } = useLandingPageSearchParams();
	const router = useRouter();

	const { handle, workspace } = useWorkspace();

	const href = getAbsoluteUrl('page', `${landingPage.handle}/${landingPage.key}`);
	return (
		<GridListCard
			id={landingPage.id}
			key={landingPage.id}
			textValue={landingPage.name}
			// setShowUpdateModal={setShowUpdateModal}
			setShowArchiveModal={setShowArchiveModal}
			setShowDeleteModal={setShowDeleteModal}
			title={landingPage.name}
			subtitle={landingPage.key}
			commandItems={[
				{
					label: 'Edit',
					icon: 'edit',
					action: () => {
						router.push(`/${handle}/pages/${landingPage.id}`);
					},
					shortcut: ['Enter'],
				},
			]}
			quickActions={{
				goToHref: href,
				copyText: href,
			}}
			stats={[
				{
					icon: 'view',
					name: 'views',
					value: landingPage.views,
				},
				{
					icon: 'click',
					name: 'clicks',
					value: landingPage.clicks,
				},
				{
					icon: 'value',
					name: 'value',
					value: formatMinorToMajorCurrency(landingPage.value ?? 0, workspace.currency),
				},
			]}
			statsHref={`/${handle}/pages/stats?assetId=${landingPage.id}`}
		/>
	);
}
