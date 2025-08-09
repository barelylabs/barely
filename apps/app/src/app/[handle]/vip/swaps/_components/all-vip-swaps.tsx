'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useWorkspace } from '@barely/hooks';
import { getAbsoluteUrl } from '@barely/utils';

import { Badge } from '@barely/ui/badge';
import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

import { CreateVipSwapButton } from './create-vip-swap-button';
import { useVipSwaps, useVipSwapsSearchParams } from './use-vip-swaps';

export function AllVipSwaps() {
	const { items, selection, setSelection, gridListRef, lastSelectedItemId, isFetching } =
		useVipSwaps();

	const { setShowUpdateModal } = useVipSwapsSearchParams();

	return (
		<GridList
			glRef={gridListRef}
			className='flex flex-col gap-2'
			aria-label='VIP Swaps'
			data-grid-list='vip-swaps'
			selectionMode='multiple'
			selectionBehavior='replace'
			onAction={async () => {
				if (!lastSelectedItemId) return;
				await setShowUpdateModal(true);
			}}
			items={items}
			selectedKeys={selection}
			setSelectedKeys={setSelection}
			renderEmptyState={() =>
				isFetching ?
					<GridListSkeleton />
				:	<NoResultsPlaceholder
						icon='vip'
						title='No VIP swaps found'
						subtitle='Create your first VIP swap'
						button={<CreateVipSwapButton />}
					/>
			}
		>
			{item => <VipSwapCard vipSwap={item} />}
		</GridList>
	);
}

function VipSwapCard({
	vipSwap,
}: {
	vipSwap: AppRouterOutputs['vipSwap']['byWorkspace']['vipSwaps'][0];
}) {
	const { handle } = useWorkspace();
	const { setShowUpdateModal, setShowArchiveModal, setShowDeleteModal } = useVipSwaps();

	// const swapUrl = `https://barely.vip/${handle}/unlock/${vipSwap.key}`;
	const swapUrl = getAbsoluteUrl('vip', `${handle}/unlock/${vipSwap.key}`);
	return (
		<GridListCard
			id={vipSwap.id}
			key={vipSwap.id}
			textValue={vipSwap.name}
			setShowUpdateModal={setShowUpdateModal}
			setShowArchiveModal={setShowArchiveModal}
			setShowDeleteModal={setShowDeleteModal}
			img={
				vipSwap.coverImage ?
					{
						src: vipSwap.coverImage.src,
						s3Key: vipSwap.coverImage.s3Key,
						blurDataURL: vipSwap.coverImage.blurDataUrl ?? undefined,
						alt: `${vipSwap.name} cover art`,
					}
				:	undefined
			}
			title={vipSwap.name}
			metadata={
				<div className='flex items-center gap-4'>
					<span className='font-mono text-sm'>{vipSwap.key}</span>
					{!vipSwap.isActive && (
						<Badge variant='subtle' size='sm'>
							Inactive
						</Badge>
					)}
					{vipSwap.passwordProtected && <Icon.lock name='lock' className='h-3 w-3' />}
				</div>
			}
			quickActions={{
				goToHref: swapUrl,
				copyText: swapUrl,
			}}
			statsHref={`/${handle}/vip/swaps/stats?vipSwapId=${vipSwap.id}`}
			stats={[
				{
					icon: 'download',
					name: 'Downloads',
					value: vipSwap.downloadCount,
				},
				{
					icon: 'email',
					name: 'Emails',
					value: vipSwap.emailCount,
				},
			]}
		>
			{vipSwap.archivedAt && <Badge variant='subtle'>Archived</Badge>}
			{vipSwap.downloadLimit && (
				<Text variant='xs/normal' className='text-muted-foreground'>
					Limit: {vipSwap.downloadLimit} downloads
				</Text>
			)}
		</GridListCard>
	);
}
