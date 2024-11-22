import type {
	AddToMailchimpAudienceNode,
	BooleanNode,
	FlowState,
	SendEmailFromTemplateGroupNode,
	SendEmailNode,
	TriggerNode,
	WaitNode,
} from '@barely/lib/server/routes/flow/flow.ui.types';
import type { IconKey } from '@barely/ui/elements/icon';
import { useMemo } from 'react';
import { useCartFunnels } from '@barely/lib/hooks/use-cart-funnels';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { MERCH_TYPES } from '@barely/lib/server/routes/product/product.constants';
import { cn } from '@barely/lib/utils/cn';
import { formatCentsToDollars } from '@barely/lib/utils/currency';
import { Handle, Position } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';
import { Switch } from '@barely/ui/elements/switch';
import { Text } from '@barely/ui/elements/typography';

import { useFlowStore } from './flow-store';

const TargetHandle = () => {
	return (
		<Handle
			type='target'
			position={Position.Top}
			// className='!w-4 !rounded-none !rounded-t-full !bg-border'
			className='opacity-0'
		/>
	);
};

const SourceHandle = () => {
	return <Handle type='source' position={Position.Bottom} className='opacity-0' />;
};

function NodeDiv({
	children,
	stripeClassName,
	icon,
	iconClassName,
	onEdit,
	title,
	subtitle,
}: {
	children?: React.ReactNode;
	stripeClassName?: string;
	icon: IconKey;
	iconClassName?: string;
	onEdit: () => void;
	title: string;
	subtitle: string;
}) {
	const IconComponent = Icon[icon];

	return (
		<div className='relative flex flex-col items-center justify-center gap-2 overflow-visible rounded border border-border bg-background p-2 px-8 '>
			<TargetHandle />
			<SourceHandle />
			<div className='flex flex-col items-center gap-2'>
				<div className='flex flex-row items-center gap-1'>
					{IconComponent && (
						<IconComponent className={cn('h-[13px] w-[13px]', iconClassName)} />
					)}
					<Text variant='md/bold'>{title}</Text>
				</div>
			</div>
			{subtitle && <Text variant='xs/normal'>{subtitle}</Text>}
			{children}
			<Button
				look='minimal'
				size='2xs'
				variant='icon'
				startIcon='edit'
				onClick={onEdit}
				className='absolute right-1 top-1'
			/>
			<div
				className={cn(
					'absolute -bottom-1 -left-[1.5px] h-1.5 w-[calc(100%+3px)] rounded-b bg-border',
					stripeClassName,
				)}
			/>
		</div>
	);
}

/* TRIGGER */

const triggerStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowTriggerModal: state.setShowTriggerModal,
	updateNodeEnabled: state.updateNodeEnabled,
});

export function TriggerNodeType({ data, id }: { id: string; data: TriggerNode['data'] }) {
	const { setCurrentNode, setShowTriggerModal, updateNodeEnabled } = useFlowStore(
		useShallow(triggerStoreSelector),
	);

	const { cartFunnels } = useCartFunnels();

	const cartFunnel = cartFunnels?.find(c => c.id === data.cartFunnelId);

	const TriggerIcon =
		Icon[
			data.type === 'newCartOrder' ? 'cart'
			: data.type === 'callFlow' ? 'flow'
			: 'fan'
		];

	return (
		<NodeDiv
			icon='trigger'
			onEdit={() => {
				setCurrentNode(id);
				setShowTriggerModal(true);
			}}
			title='Trigger'
			subtitle={
				data.type === 'newCartOrder' ?
					`New cart order${cartFunnel?.name ? `: ${cartFunnel?.name}` : ''}`
				: data.type === 'callFlow' ?
					'Trigger from another flow'
				: data.type === 'newFan' ?
					'New fan'
				:	'Choose a trigger'
			}
			iconClassName='h-[16px] w-[16px] text-amber-400'
			stripeClassName='bg-amber-400'
		>
			{TriggerIcon && <TriggerIcon className='h-[16px] w-[16px]' />}
			<Switch
				checked={data.enabled}
				onCheckedChange={checked => updateNodeEnabled(id, checked)}
				size='md'
				className='data-[state=checked]:bg-amber-400'
			/>
		</NodeDiv>

		// <div className='relative flex items-center justify-center rounded border border-border bg-background p-2'>
		// 	<div className='flex flex-col items-center gap-2'>
		// 		<div className='flex flex-row items-center gap-1'>
		// 			<Icon.trigger className='h-[13px] w-[13px]' />
		// 			<Text variant='md/bold'>Trigger</Text>
		// 		</div>

		// 		{data.type === 'newCartOrder' ?
		// 			<>
		// 				<Text variant='xs/normal'>New cart order:</Text>
		// 				<Text variant='xs/normal'>{cartFunnel?.name}</Text>
		// 			</>
		// 		: data.type === 'callFlow' ?
		// 			<div className='flex flex-row items-center gap-1'>
		// 				<Icon.trigger className='h-3 w-3' />
		// 				<Text variant='xs/normal'>Trigger from another flow</Text>
		// 			</div>
		// 		: data.type === 'newFan' ?
		// 			<div className='flex flex-row items-center gap-1'>
		// 				<Icon.fan className='h-[13px] w-[13px]' />
		// 				<Text variant='xs/normal'>New fan</Text>
		// 			</div>
		// 		:	<Text variant='xs/normal'>Choose a trigger</Text>}
		// 	</div>
		// 	<Button
		// 		look='ghost'
		// 		size='2xs'
		// 		variant='icon'
		// 		startIcon='edit'
		// 		onClick={() => {
		// 			setCurrentNode(id);
		// 			setShowTriggerModal(true);
		// 		}}
		// 		className='absolute right-1 top-1'
		// 	/>
		// 	<Handle type='source' position={Position.Bottom} />
		// </div>
	);
}

/* EMPTY */

const emptyStoreSelector = (state: FlowState) => ({
	replaceEmptyWithNode: state.replaceEmptyWithActionNode,
});

export function EmptyNodeType({ id }: { id: string }) {
	const { replaceEmptyWithNode } = useFlowStore(useShallow(emptyStoreSelector));

	return (
		<div className='flex items-center justify-center rounded border border-dashed border-border bg-background p-2'>
			<TargetHandle />
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
					className='group hover:bg-orange-400'
					iconClassName='group-hover:text-background'
				/>
				<Button
					look='muted'
					size='sm'
					variant='icon'
					startIcon='email'
					onClick={() => replaceEmptyWithNode(id, 'sendEmail')}
					className='group hover:bg-blue-400'
					iconClassName='group-hover:text-background'
				/>
				<Button
					look='muted'
					size='sm'
					variant='icon'
					startIcon='emailTemplateGroup'
					onClick={() => replaceEmptyWithNode(id, 'sendEmailFromTemplateGroup')}
					className='group hover:bg-indigo-400'
					iconClassName='group-hover:text-background'
				/>
				<Button
					look='muted'
					size='sm'
					variant='icon'
					startIcon='branch'
					onClick={() => replaceEmptyWithNode(id, 'boolean')}
					className='group hover:bg-green-400'
					iconClassName='group-hover:text-background'
				/>
				<Button
					look='muted'
					size='sm'
					variant='icon'
					startIcon='mailchimp'
					onClick={() => replaceEmptyWithNode(id, 'addToMailchimpAudience')}
					className='group hover:bg-mailchimp-500'
					iconClassName='group-hover:text-background'
				/>
			</div>
			<Handle type='source' position={Position.Bottom} />
		</div>
	);
}

/* WAIT */

const waitStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowWaitModal: state.setShowWaitModal,
});

export function WaitNodeType({ id, data }: { id: string; data: WaitNode['data'] }) {
	const { setCurrentNode, setShowWaitModal } = useFlowStore(
		useShallow(waitStoreSelector),
	);

	return (
		<NodeDiv
			icon='wait'
			onEdit={() => {
				setCurrentNode(id);
				setShowWaitModal(true);
			}}
			title='Wait'
			subtitle={`Wait for ${data.waitFor} ${data.waitForUnits}`}
			iconClassName='h-[13.5px] w-[13.5px] text-orange-400'
			stripeClassName='bg-orange-400'
		/>
		// <div className='relative flex w-[172px] flex-col items-center justify-center rounded border border-border bg-background p-2 px-4'>
		// 	<TargetHandle />
		// 	{/* <Handle type='target' position={Position.Top} /> */}
		// 	<div className='flex flex-col items-center gap-2'>
		// 		<div className='flex flex-row items-center gap-1'>
		// 			<Icon.wait className='h-[14px] w-[14px]' />
		// 			<Text variant='md/bold'>Wait</Text>
		// 		</div>
		// 		<Text variant='xs/normal' className='text-center'>
		// 			Wait for {data.waitFor} {data.waitForUnits}
		// 		</Text>
		// 	</div>
		// 	<Button
		// 		look='ghost'
		// 		size='2xs'
		// 		variant='icon'
		// 		startIcon='edit'
		// 		onClick={() => {
		// 			setCurrentNode(id);
		// 			setShowWaitModal(true);
		// 		}}
		// 		className='absolute right-1 top-1'
		// 	/>
		// 	<SourceHandle />
		// 	{/* <Handle type='source' position={Position.Bottom} id={`${id}-bottom`} /> */}
		// </div>
	);
}

/* SEND EMAIL */

const sendEmailStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowEmailModal: state.setShowEmailModal,
	updateNodeEnabled: state.updateNodeEnabled,
});

export function SendEmailNodeType({
	id,
	data,
}: {
	id: string;
	data: SendEmailNode['data'];
}) {
	const { setCurrentNode, setShowEmailModal, updateNodeEnabled } = useFlowStore(
		useShallow(sendEmailStoreSelector),
	);

	return (
		<NodeDiv
			icon='email'
			onEdit={() => {
				setCurrentNode(id);
				setShowEmailModal(true);
			}}
			title='Email'
			subtitle={`Send "${data.name}"`}
			iconClassName='h-[16px] w-[16px] text-blue-400'
			stripeClassName='bg-blue-400'
		>
			<Switch
				checked={data.enabled}
				onCheckedChange={checked => updateNodeEnabled(id, checked)}
				size='md'
				className='data-[state=checked]:bg-blue-400'
			/>
			<div className='flex flex-row items-center gap-1 text-muted-foreground'>
				<Icon.value className='h-2.5 w-2.5' />
				<Text variant='xs/normal'>{formatCentsToDollars(data.value ?? 0)}</Text>
			</div>
		</NodeDiv>
	);
}

/* SEND EMAIL FROM TEMPLATE GROUP */

const sendEmailFromTemplateGroupStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowEmailFromTemplateGroupModal: state.setShowEmailFromTemplateGroupModal,
	updateNodeEnabled: state.updateNodeEnabled,
});

export function SendEmailFromTemplateGroupNodeType({
	id,
	data,
}: {
	id: string;
	data: SendEmailFromTemplateGroupNode['data'];
}) {
	const { setCurrentNode, setShowEmailFromTemplateGroupModal, updateNodeEnabled } =
		useFlowStore(useShallow(sendEmailFromTemplateGroupStoreSelector));

	const { handle } = useWorkspace();

	const { data: emailTemplateGroup } = api.emailTemplateGroup.byId.useQuery({
		id: data.emailTemplateGroupId,
		handle,
	});

	return (
		<NodeDiv
			icon='email'
			onEdit={() => {
				setCurrentNode(id);
				setShowEmailFromTemplateGroupModal(true);
			}}
			title='Email Template Group'
			subtitle={`Send Email from "${emailTemplateGroup?.name}"`}
			iconClassName='h-[16px] w-[16px] text-indigo-400'
			stripeClassName='bg-indigo-400'
		>
			<Switch
				checked={data.enabled}
				onCheckedChange={checked => updateNodeEnabled(id, checked)}
				size='md'
				className='data-[state=checked]:bg-indigo-400'
			/>
		</NodeDiv>
	);
}
/* BOOLEAN */

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
		<NodeDiv
			icon='branch'
			onEdit={() => {
				setCurrentNode(id);
				setShowBooleanModal(true);
			}}
			title='Decision'
			subtitle={
				data.booleanCondition === 'hasOrderedProduct' ? 'Ordered product:'
				: data.booleanCondition === 'hasOrderedCart' ?
					'Ordered cart:'
				:	`at least $${data.totalOrderAmount}`
			}
			iconClassName='h-[16px] w-[16px] text-green-400'
			stripeClassName='bg-green-400'
		>
			{data.booleanCondition === 'hasOrderedProduct' ?
				// <Text variant='xs/normal'>Has ordered product: {product?.name}</Text>
				<>
					{/* <Text variant='xs/normal'>Ordered product:</Text> */}
					<div className='flex flex-row items-center gap-1'>
						{ProductIcon && <ProductIcon className='h-[13px] w-[13px]' />}
						<Text variant='xs/normal'>{product?.name}</Text>
					</div>
				</>
			: data.booleanCondition === 'hasOrderedCart' ?
				<>
					{/* <Text variant='xs/normal'>Ordered cart:</Text> */}
					<div className='flex flex-row items-center gap-1'>
						<Icon.cart className='h-[13px] w-[13px]' />
						<Text variant='xs/normal'>{cartFunnel?.name}</Text>
					</div>
				</>
				// : data.booleanCondition === 'hasOrderedAmount' ?
				// 	<Text variant='xs/normal'>Has ordered at least: ${data.totalOrderAmount}</Text>
			:	null}
		</NodeDiv>

		// <div className='relative flex flex-col items-center justify-center rounded border border-border bg-background p-2 px-8'>
		// 	<Handle type='target' position={Position.Top} />
		// 	<div className='flex flex-col items-center gap-2'>
		// 		<div className='flex flex-row items-center gap-1'>
		// 			<Icon.branch className='h-[13px] w-[13px]' />
		// 			<Text variant='md/bold'>Decision</Text>
		// 		</div>
		// 		<div className='flex flex-col items-center gap-2'>
		// 			{data.booleanCondition === 'hasOrderedProduct' ?
		// 				// <Text variant='xs/normal'>Has ordered product: {product?.name}</Text>
		// 				<>
		// 					<Text variant='xs/normal'>Ordered product:</Text>
		// 					<div className='flex flex-row items-center gap-1'>
		// 						{ProductIcon && <ProductIcon className='h-[13px] w-[13px]' />}
		// 						<Text variant='xs/normal'>{product?.name}</Text>
		// 					</div>
		// 				</>
		// 			: data.booleanCondition === 'hasOrderedCart' ?
		// 				<>
		// 					<Text variant='xs/normal'>Ordered cart:</Text>
		// 					<div className='flex flex-row items-center gap-1'>
		// 						<Icon.cart className='h-[13px] w-[13px]' />
		// 						<Text variant='xs/normal'>{cartFunnel?.name}</Text>
		// 					</div>
		// 				</>
		// 			: data.booleanCondition === 'hasOrderedAmount' ?
		// 				<Text variant='xs/normal'>
		// 					Has ordered at least: ${data.totalOrderAmount}
		// 				</Text>
		// 			:	null}
		// 		</div>
		// 	</div>
		// 	<Button
		// 		look='minimal'
		// 		size='2xs'
		// 		variant='icon'
		// 		startIcon='edit'
		// 		onClick={() => {
		// 			setCurrentNode(id);
		// 			setShowBooleanModal(true);
		// 		}}
		// 		className='absolute right-1 top-1'
		// 	/>
		// 	<Handle type='source' position={Position.Bottom} id={`${id}-bottom`} />
		// </div>
	);
}

/* MAILCHIMP AUDIENCE */

const mailchimpStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowMailchimpAudienceModal: state.setShowMailchimpAudienceModal,
	updateNodeEnabled: state.updateNodeEnabled,
});

export function MailchimpAudienceNodeType({
	id,
	data,
}: {
	id: string;
	data: AddToMailchimpAudienceNode['data'];
}) {
	const { setCurrentNode, setShowMailchimpAudienceModal, updateNodeEnabled } =
		useFlowStore(useShallow(mailchimpStoreSelector));

	const { handle } = useWorkspace();
	const { data: mailchimpAudiences } = api.mailchimp.audiencesByWorkspace.useQuery({
		handle,
	});

	const currentMailchimpAudience = mailchimpAudiences?.find(
		audience => audience.id === data.mailchimpAudienceId,
	);

	return (
		<NodeDiv
			icon='mailchimp'
			onEdit={() => {
				setCurrentNode(id);
				setShowMailchimpAudienceModal(true);
			}}
			title='Add to Mailchimp Audience'
			subtitle={`Audience: ${currentMailchimpAudience?.name}` ?? 'Choose an audience'}
			iconClassName='h-[16px] w-[16px] text-mailchimp-400'
			stripeClassName='bg-mailchimp-400'
		>
			<Switch
				checked={data.enabled}
				onCheckedChange={checked => updateNodeEnabled(id, checked)}
				size='md'
				className='data-[state=checked]:bg-mailchimp-400'
			/>
		</NodeDiv>
		// <div className='relative flex flex-col items-center justify-center rounded border border-border bg-background p-2 px-8'>
		// 	<Handle type='target' position={Position.Top} />
		// 	<div className='flex flex-col items-center gap-2'>
		// 		<div className='flex flex-row items-center gap-1'>
		// 			<Icon.mailchimp className='h-[13px] w-[13px]' />
		// 			<Text variant='md/bold'>Add to Mailchimp Audience</Text>
		// 		</div>
		// 		<Text variant='xs/normal'>{currentMailchimpAudience?.name}</Text>
		// 	</div>
		// 	<Button
		// 		look='minimal'
		// 		size='2xs'
		// 		variant='icon'
		// 		startIcon='edit'
		// 		onClick={() => {
		// 			setCurrentNode(id);
		// 			setShowMailchimpAudienceModal(true);
		// 		}}
		// 		className='absolute right-1 top-1'
		// 	/>
		// 	<Handle type='source' position={Position.Bottom} id={`${id}-bottom`} />
		// </div>
	);
}
