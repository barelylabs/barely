'use client';

import type { z } from 'zod/v4';
import { useWorkspaceWithAll, useZodForm } from '@barely/hooks';
import { updateWorkspaceFulfillmentModeSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { SettingsCardForm } from '@barely/ui/components/settings-card';
import { SelectField } from '@barely/ui/forms/select-field';
import { Text } from '@barely/ui/typography';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import {
	CartShippingAddress,
	CartShippingPhone,
	CartSupportEmail,
} from '~/app/[handle]/merch/carts/_components/cart-settings';

const FULFILLMENT_MODE_OPTIONS = [
	{
		value: 'artist_all' as const,
		label: 'I fulfill all orders myself',
		description: 'You handle all order fulfillment and shipping',
	},
	{
		value: 'barely_us' as const,
		label: 'Barely fulfills US orders',
		description: 'Barely handles US orders; you fulfill international',
	},
	{
		value: 'barely_worldwide' as const,
		label: 'Barely fulfills all orders',
		description: 'Barely handles all order fulfillment worldwide',
	},
];

export default function MerchLogisticsPage() {
	const workspace = useWorkspaceWithAll();

	return (
		<>
			<DashContentHeader
				title='Merch Logistics'
				subtitle='Manage your fulfillment and support details.'
			/>
			<DashContent>
				{workspace.barelyFulfillmentEligible && <FulfillmentModeForm />}
				<CartSupportEmail />
				<CartShippingPhone />
				<CartShippingAddress />
			</DashContent>
		</>
	);
}

function FulfillmentModeForm() {
	const workspace = useWorkspaceWithAll();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const form = useZodForm({
		schema: updateWorkspaceFulfillmentModeSchema,
		values: {
			barelyFulfillmentMode: workspace.barelyFulfillmentMode,
		},
	});

	const { mutateAsync: updateFulfillmentMode } = useMutation(
		trpc.workspace.updateFulfillmentMode.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.workspace.byHandle.queryKey({ handle: workspace.handle }),
				});
				await queryClient.invalidateQueries({
					queryKey: trpc.workspace.byHandleWithAll.queryKey({ handle: workspace.handle }),
				});
				form.reset();
			},
		}),
	);

	const onSubmit = async (data: z.infer<typeof updateWorkspaceFulfillmentModeSchema>) => {
		await updateFulfillmentMode({
			handle: workspace.handle,
			barelyFulfillmentMode: data.barelyFulfillmentMode,
		});
	};

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title='Fulfillment Mode'
			subtitle='Choose how orders are fulfilled for your workspace.'
			disableSubmit={!form.formState.isDirty}
		>
			<SelectField
				label='Fulfillment Mode'
				control={form.control}
				name='barelyFulfillmentMode'
				options={FULFILLMENT_MODE_OPTIONS.map(option => ({
					value: option.value,
					label: (
						<div className='flex flex-col'>
							<span>{option.label}</span>
							<span className='text-xs text-muted-foreground'>{option.description}</span>
						</div>
					),
				}))}
			/>
			<Text variant='sm/normal' className='mt-4' muted>
				When Barely handles fulfillment, shipping rates are calculated from our US
				warehouse. A fulfillment fee may apply based on your agreement.
			</Text>
		</SettingsCardForm>
	);
}
