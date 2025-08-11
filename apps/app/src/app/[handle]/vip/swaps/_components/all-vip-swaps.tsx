'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useWorkspace } from '@barely/hooks';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
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
						title='No swaps found'
						subtitle='Create your first swap'
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

	return (
		<GridListCard id={vipSwap.id} key={vipSwap.id} textValue={vipSwap.name}>
			{vipSwap.archivedAt && <Badge variant='subtle'>Archived</Badge>}
			<div className='flex w-full items-center justify-between'>
				<div className='flex flex-col gap-1'>
					<div className='flex items-center gap-2'>
						<Text variant='md/semibold'>{vipSwap.name}</Text>
						{!vipSwap.isActive && <Badge variant='subtle'>Inactive</Badge>}
						{vipSwap.passwordProtected && (
							<Icon.lock name='lock' className='h-4 w-4 text-muted-foreground' />
						)}
					</div>
					<div className='flex items-center gap-4 text-sm text-muted-foreground'>
						<span className='font-mono'>{vipSwap.key}</span>
						{vipSwap.downloadLimit && (
							<span>Limit: {vipSwap.downloadLimit} downloads</span>
						)}
						{vipSwap.file.name && <span>{vipSwap.file.name}</span>}
					</div>
				</div>
				<Button
					look='ghost'
					size='sm'
					href={`/${handle}/vip/swaps/stats?vipSwapId=${vipSwap.id}`}
					className='flex h-auto flex-col items-end gap-1 py-1'
				>
					<div className='flex items-center gap-2'>
						<Icon.download name='download' className='h-4 w-4' />
						<Text variant='sm/normal'>{vipSwap.downloadCount}</Text>
					</div>
					<Text variant='xs/normal' className='text-muted-foreground'>
						{vipSwap.emailCount} emails
					</Text>
				</Button>
			</div>
		</GridListCard>
	);
}
