'use client';

import type { CartFunnel } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';

import { useCartFunnelContext } from '~/app/[handle]/carts/_components/cartFunnel-context';
import { CreateCartFunnelButton } from '~/app/[handle]/carts/_components/create-cartFunnel-button';

export function AllCartFunnels() {
	const {
		cartFunnels,
		cartFunnelSelection,
		setCartFunnelSelection,
		gridListRef,
		setShowUpdateCartFunnelModal,
	} = useCartFunnelContext();

	return (
		<>
			<GridList
				glRef={gridListRef}
				aria-label='Carts'
				className='flex flex-col gap-2'
				// behavior
				selectionMode='multiple'
				selectionBehavior='replace'
				// funnels
				items={cartFunnels}
				selectedKeys={cartFunnelSelection}
				setSelectedKeys={setCartFunnelSelection}
				onAction={() => {
					if (!cartFunnelSelection) return;
					setShowUpdateCartFunnelModal(true);
				}}
				// empty
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='cart'
						title='No carts found.'
						subtitle='Create a cart to get started.'
						button={<CreateCartFunnelButton />}
					/>
				)}
			>
				{funnel => <CartFunnelCard cartFunnel={funnel} />}
			</GridList>
			{/* <pre>{JSON.stringify(mailchimpAudiences, null, 2)}</pre> */}
		</>
	);
}

function CartFunnelCard({ cartFunnel }: { cartFunnel: CartFunnel }) {
	const {
		setShowUpdateCartFunnelModal: setShowUpdateCartFunnelModal,
		setShowArchiveCartFunnelModal: setShowArchiveCartFunnelModal,
		setShowDeleteCartFunnelModal: setShowDeleteCartFunnelModal,
	} = useCartFunnelContext();

	const href = `https://barelycart.com/${cartFunnel.handle}/${cartFunnel.key}`;

	return (
		<GridListCard
			id={cartFunnel.id}
			key={cartFunnel.id}
			textValue={cartFunnel.name}
			setShowUpdateModal={setShowUpdateCartFunnelModal}
			setShowArchiveModal={setShowArchiveCartFunnelModal}
			setShowDeleteModal={setShowDeleteCartFunnelModal}
			title={cartFunnel.name}
			subtitle={cartFunnel.key.toUpperCase()}
			quickActions={{
				goToHref: href,
				copyText: href,
			}}
		></GridListCard>
	);
}
