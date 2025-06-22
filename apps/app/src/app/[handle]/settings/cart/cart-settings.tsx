'use client';

import type { z } from 'zod/v4';
import { useUpdateWorkspace } from '@barely/lib/hooks/use-update-workspace';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
// import { useWorkspaceUpdateForm } from '@barely/lib/hooks/use-workspace-update-form';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { updateWorkspaceSchema } from '@barely/lib/server/routes/workspace/workspace.schema';

import { SettingsCardForm } from '@barely/ui/components/settings-card';
import { TextField } from '@barely/ui/forms/text-field';

export function CartShippingAddress() {
	const { workspace } = useWorkspace();

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
		await updateWorkspace(data);
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
	const { workspace } = useWorkspace();

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
		await updateWorkspace(data);
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
