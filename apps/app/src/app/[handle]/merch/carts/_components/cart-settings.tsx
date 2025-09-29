'use client';

import type { z } from 'zod/v4';
import { useUpdateWorkspace, useWorkspaceWithAll, useZodForm } from '@barely/hooks';
import { updateWorkspaceSchema } from '@barely/validators';

import { SettingsCardForm } from '@barely/ui/components/settings-card';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';

export function CartShippingAddress() {
	const workspace = useWorkspaceWithAll();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			shippingAddressLine1: workspace.shippingAddressLine1,
			shippingAddressLine2: workspace.shippingAddressLine2,
			shippingAddressCity: workspace.shippingAddressCity,
			shippingAddressState: workspace.shippingAddressState,
			shippingAddressPostalCode: workspace.shippingAddressPostalCode,
			shippingAddressCountry: workspace.shippingAddressCountry,
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

	const country = form.watch('shippingAddressCountry');

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title='Shipping Address'
			subtitle='This is the address that you will ship orders from.'
			disableSubmit={!form.formState.isDirty}
		>
			<SelectField
				label='Country'
				control={form.control}
				name='shippingAddressCountry'
				options={[
					{
						label: (
							<div className='flex flex-row items-center gap-[1px]'>
								<picture className='mr-2 flex items-center'>
									<img
										alt='United States'
										src={`https://flag.vercel.app/m/US.svg`}
										className='h-[10px] w-[16px]'
									/>
								</picture>
								United States
							</div>
						),
						value: 'US',
					},
					{
						label: (
							<div className='flex flex-row items-center gap-[1px]'>
								<picture className='mr-2 flex items-center'>
									<img
										alt='United Kingdom'
										src={`https://flag.vercel.app/m/GB.svg`}
										className='h-[10px] w-[16px]'
									/>
								</picture>
								United Kingdom
							</div>
						),
						value: 'GB',
					},
				]}
			/>
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
			<TextField
				label={country === 'US' ? 'State' : 'Region'} // is province correct for the UK? is England a province?
				control={form.control}
				name='shippingAddressState'
			/>
			<TextField
				label='Postal Code'
				control={form.control}
				name='shippingAddressPostalCode'
			/>
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
