import type {
	AddToMailchimpAudienceNode,
	BooleanNode,
	FlowState,
	SendEmailNode,
	TriggerNode,
	WaitNode,
} from '@barely/lib/server/routes/flow/flow.ui.types';
import { useMemo } from 'react';
import { useCartFunnels } from '@barely/lib/hooks/use-cart-funnels';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { MERCH_TYPES } from '@barely/lib/server/routes/product/product.constants';
import { Handle, Position } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';
import { Text } from '@barely/ui/elements/typography';

import { useFlowStore } from './flow-store';

const triggerStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowTriggerModal: state.setShowTriggerModal,
});

export function TriggerNodeType({ data, id }: { id: string; data: TriggerNode['data'] }) {
	const { setCurrentNode, setShowTriggerModal } = useFlowStore(
		useShallow(triggerStoreSelector),
	);

	const { cartFunnels } = useCartFunnels();

	const cartFunnel = cartFunnels?.find(c => c.id === data.cartFunnelId);

	return (
		<div className='relative flex items-center justify-center rounded border border-border bg-background p-2'>
			<div className='flex flex-col items-center gap-2'>
				<div className='flex flex-row items-center gap-1'>
					<Icon.trigger className='h-[13px] w-[13px]' />
					<Text variant='md/bold'>Trigger</Text>
				</div>

				{data.type === 'newCartOrder' ?
					<>
						<Text variant='xs/normal'>New cart order:</Text>
						<Text variant='xs/normal'>{cartFunnel?.name}</Text>
					</>
				: data.type === 'callFlow' ?
					<div className='flex flex-row items-center gap-1'>
						<Icon.trigger className='h-3 w-3' />
						<Text variant='xs/normal'>Trigger from another flow</Text>
					</div>
				: data.type === 'newFan' ?
					<div className='flex flex-row items-center gap-1'>
						<Icon.fan className='h-[13px] w-[13px]' />
						<Text variant='xs/normal'>New fan</Text>
					</div>
				:	<Text variant='xs/normal'>Choose a trigger</Text>}
			</div>
			<Button
				look='ghost'
				size='2xs'
				variant='icon'
				startIcon='edit'
				onClick={() => {
					setCurrentNode(id);
					setShowTriggerModal(true);
				}}
				className='absolute right-1 top-1'
			/>
			<Handle type='source' position={Position.Bottom} />
		</div>
	);
}

const emptyStoreSelector = (state: FlowState) => ({
	replaceEmptyWithNode: state.replaceEmptyWithNode,
});

export function EmptyNodeType({ id }: { id: string }) {
	const { replaceEmptyWithNode } = useFlowStore(useShallow(emptyStoreSelector));

	return (
		<div className='flex items-center justify-center rounded border border-dashed border-border bg-background p-2'>
			<Handle type='target' position={Position.Top} />
			<div
				className='grid auto-cols-fr gap-2'
				style={{
					gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
					maxWidth: 'calc(4 * (24px + 0.5rem))',
				}}
			>
				<Button
					look='muted'
					size='sm'
					variant='icon'
					startIcon='wait'
					onClick={() => replaceEmptyWithNode(id, 'wait')}
				/>
				<Button
					look='muted'
					size='sm'
					variant='icon'
					startIcon='email'
					onClick={() => replaceEmptyWithNode(id, 'sendEmail')}
				/>
				<Button
					look='muted'
					size='sm'
					variant='icon'
					startIcon='branch'
					onClick={() => replaceEmptyWithNode(id, 'boolean')}
				/>
				<Button
					look='muted'
					size='sm'
					variant='icon'
					startIcon='mailchimp'
					onClick={() => replaceEmptyWithNode(id, 'addToMailchimpAudience')}
				/>
			</div>
		</div>
	);
}

const waitStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowWaitModal: state.setShowWaitModal,
});

export function WaitNodeType({ id, data }: { id: string; data: WaitNode['data'] }) {
	const { setCurrentNode, setShowWaitModal } = useFlowStore(
		useShallow(waitStoreSelector),
	);

	return (
		<div className='relative flex w-[172px] flex-col items-center justify-center rounded border border-border bg-background p-2 px-4'>
			<Handle type='target' position={Position.Top} />
			<div className='flex flex-col items-center gap-2'>
				<div className='flex flex-row items-center gap-1'>
					<Icon.wait className='h-[14px] w-[14px]' />
					<Text variant='md/bold'>Wait</Text>
				</div>
				<Text variant='xs/normal' className='text-center'>
					Wait for {data.waitFor} {data.waitForUnits}
				</Text>
			</div>
			<Button
				look='ghost'
				size='2xs'
				variant='icon'
				startIcon='edit'
				onClick={() => {
					setCurrentNode(id);
					setShowWaitModal(true);
				}}
				className='absolute right-1 top-1'
			/>
			<Handle type='source' position={Position.Bottom} id={`${id}-bottom`} />
		</div>
	);
}

const sendEmailStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowEmailModal: state.setShowEmailModal,
});

export function SendEmailNodeType({
	id,
	data,
}: {
	id: string;
	data: SendEmailNode['data'];
}) {
	const { setCurrentNode, setShowEmailModal } = useFlowStore(
		useShallow(sendEmailStoreSelector),
	);

	return (
		<div className='relative flex flex-col items-center justify-center rounded border border-border bg-background p-2 px-8'>
			<Handle type='target' position={Position.Top} />
			<div className='flex flex-col items-center gap-2'>
				<div className='flex flex-row items-center gap-1'>
					<Icon.email className='h-[13px] w-[13px]' />
					<Text variant='md/bold'>Send Email</Text>
				</div>
				<Text variant='sm/bold'>{data.subject}</Text>
			</div>
			<Button
				look='minimal'
				size='2xs'
				variant='icon'
				startIcon='edit'
				onClick={() => {
					setCurrentNode(id);
					setShowEmailModal(true);
				}}
				className='absolute right-1 top-1'
			/>
			<Handle type='source' position={Position.Bottom} id={`${id}-bottom`} />
		</div>
	);
}

const booleanStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowBooleanModal: state.setShowBooleanModal,
});

export function BooleanNodeType({ id, data }: { id: string; data: BooleanNode['data'] }) {
	const { setCurrentNode, setShowBooleanModal } = useFlowStore(
		useShallow(booleanStoreSelector),
	);

	const { handle } = useWorkspace();

	const { data: infiniteProducts } = api.product.byWorkspace.useInfiniteQuery(
		{
			handle,
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const product = infiniteProducts?.pages[0]?.products.find(p => p.id === data.productId);

	const { data: infiniteCartFunnels } = api.cartFunnel.byWorkspace.useInfiniteQuery(
		{
			handle,
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const cartFunnel = infiniteCartFunnels?.pages[0]?.cartFunnels.find(
		p => p.id === data.cartFunnelId,
	);

	const ProductIcon = useMemo(() => {
		if (!product?.merchType || !MERCH_TYPES.includes(product?.merchType)) return null;

		const IconComponent = Icon[product?.merchType as keyof typeof Icon];
		if (!IconComponent) return null;

		return IconComponent;
	}, [product?.merchType]);

	return (
		<div className='relative flex flex-col items-center justify-center rounded border border-border bg-background p-2 px-8'>
			<Handle type='target' position={Position.Top} />
			<div className='flex flex-col items-center gap-2'>
				<div className='flex flex-row items-center gap-1'>
					<Icon.branch className='h-[13px] w-[13px]' />
					<Text variant='md/bold'>Decision</Text>
				</div>
				<div className='flex flex-col items-center gap-2'>
					{data.booleanCondition === 'hasOrderedProduct' ?
						// <Text variant='xs/normal'>Has ordered product: {product?.name}</Text>
						<>
							<Text variant='xs/normal'>Ordered product:</Text>
							<div className='flex flex-row items-center gap-1'>
								{ProductIcon && <ProductIcon className='h-[13px] w-[13px]' />}
								<Text variant='xs/normal'>{product?.name}</Text>
							</div>
						</>
					: data.booleanCondition === 'hasOrderedCart' ?
						<>
							<Text variant='xs/normal'>Ordered cart:</Text>
							<div className='flex flex-row items-center gap-1'>
								<Icon.cart className='h-[13px] w-[13px]' />
								<Text variant='xs/normal'>{cartFunnel?.name}</Text>
							</div>
						</>
					: data.booleanCondition === 'hasOrderedAmount' ?
						<Text variant='xs/normal'>
							Has ordered at least: ${data.totalOrderAmount}
						</Text>
					:	null}
				</div>
			</div>
			<Button
				look='minimal'
				size='2xs'
				variant='icon'
				startIcon='edit'
				onClick={() => {
					setCurrentNode(id);
					setShowBooleanModal(true);
				}}
				className='absolute right-1 top-1'
			/>
			<Handle type='source' position={Position.Bottom} id={`${id}-bottom`} />
		</div>
	);
}

const mailchimpStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowMailchimpAudienceModal: state.setShowMailchimpAudienceModal,
});

export function MailchimpAudienceNodeType({
	id,
	data,
}: {
	id: string;
	data: AddToMailchimpAudienceNode['data'];
}) {
	const { setCurrentNode, setShowMailchimpAudienceModal } = useFlowStore(
		useShallow(mailchimpStoreSelector),
	);

	const { handle } = useWorkspace();
	const { data: mailchimpAudiences } = api.mailchimp.audiencesByWorkspace.useQuery(
		{ handle },
		// {
		// 	select: data =>
		// 		data.map(audience => ({
		// 			label: audience.name,
		// 			value: audience.id,
		// 		})),
		// },
	);

	const currentMailchimpAudience = mailchimpAudiences?.find(
		audience => audience.id === data.mailchimpAudienceId,
	);

	return (
		<div className='relative flex flex-col items-center justify-center rounded border border-border bg-background p-2 px-8'>
			<Handle type='target' position={Position.Top} />
			<div className='flex flex-col items-center gap-2'>
				<div className='flex flex-row items-center gap-1'>
					<Icon.mailchimp className='h-[13px] w-[13px]' />
					<Text variant='md/bold'>Add to Mailchimp Audience</Text>
				</div>
				<Text variant='xs/normal'>{currentMailchimpAudience?.name}</Text>
			</div>
			<Button
				look='minimal'
				size='2xs'
				variant='icon'
				startIcon='edit'
				onClick={() => {
					setCurrentNode(id);
					setShowMailchimpAudienceModal(true);
				}}
				className='absolute right-1 top-1'
			/>
			<Handle type='source' position={Position.Bottom} id={`${id}-bottom`} />
		</div>
	);
}
