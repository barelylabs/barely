'use client';

import type { z } from 'zod/v4';
import { useUpdateWorkspace, useWorkspaceWithAll, useZodForm } from '@barely/hooks';
import { updateWorkspaceSchema } from '@barely/validators';

import { SettingsCardForm } from '@barely/ui/components/settings-card';
import { TextField } from '@barely/ui/forms/text-field';

export function CartShippingAddress() {
	const workspace = useWorkspaceWithAll();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			shippingAddressLine1: workspace.shippingAddressLine1,
		},
	});

	const { updateWorkspace } = useUpdateWorkspace({
		onSuccess: () => form.reset(),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSchema>) => {
		await updateWorkspace({
			...data,
			handle: workspace.handle,
		});
	};

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title='Shipping Address'
			subtitle='Please enter your shipping address.'
			disableSubmit={!form.formState.isDirty}
		>
			<TextField
				label='Address Line 1'
				control={form.control}
				name='shippingAddressLine1'
			/>
			<TextField
				label='Address Line 2'
				control={form.control}
				name='shippingAddressLine2'
			/>
			<TextField label='City' control={form.control} name='shippingAddressCity' />
			<TextField label='State' control={form.control} name='shippingAddressState' />
			<TextField
				label='Postal Code'
				control={form.control}
				name='shippingAddressPostalCode'
			/>
			<TextField label='Country' control={form.control} name='shippingAddressCountry' />
		</SettingsCardForm>
	);
}

export function CartSupportEmail() {
	const workspace = useWorkspaceWithAll();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			cartSupportEmail: workspace.cartSupportEmail,
		},
	});

	const { updateWorkspace } = useUpdateWorkspace({
		onSuccess: () => form.reset(),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSchema>) => {
		await updateWorkspace({
			...data,
			handle: workspace.handle,
		});
	};

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title='Support Email'
			subtitle='Please enter your support email.'
			disableSubmit={!form.formState.isDirty}
		>
			<TextField label='Email' control={form.control} name='cartSupportEmail' />
		</SettingsCardForm>
	);
}
