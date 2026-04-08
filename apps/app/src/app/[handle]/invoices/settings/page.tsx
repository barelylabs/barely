'use client';

import type { z } from 'zod/v4';
import { useUpdateWorkspace, useWorkspaceWithAll, useZodForm } from '@barely/hooks';
import { isProduction } from '@barely/utils';
import { updateWorkspaceSchema } from '@barely/validators';

import { Badge } from '@barely/ui/badge';
import { Card } from '@barely/ui/card';
import { SettingsCardForm } from '@barely/ui/components/settings-card';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { InvoiceNav } from '~/app/[handle]/invoices/_components/invoice-nav';

export default function InvoiceSettingsPage() {
	const workspace = useWorkspaceWithAll();

	const chargesEnabled =
		isProduction() ?
			workspace.stripeConnectChargesEnabled
		:	workspace.stripeConnectChargesEnabled_devMode;

	const hasAddress = !!workspace.invoiceAddressLine1;
	const hasSupportEmail = !!workspace.invoiceSupportEmail;
	const setupComplete = chargesEnabled && hasAddress && hasSupportEmail;

	return (
		<>
			<DashContentHeader title='Invoices' />
			<DashContent>
				<InvoiceNav />
				<div className='mt-6 space-y-6'>
					{!setupComplete && (
						<Card>
							<div className='flex flex-col gap-3 p-4'>
								<div className='flex flex-row items-center gap-2'>
									<Icon.checkCircle className='h-5 w-5 text-muted-foreground' />
									<H size='5'>Setup Checklist</H>
								</div>
								<Text variant='sm/normal' className='text-muted-foreground'>
									Complete these steps to start sending invoices.
								</Text>
								<div className='space-y-2'>
									<div className='flex items-center gap-2'>
										{chargesEnabled ?
											<Icon.check className='h-4 w-4 text-green-600' />
										:	<Icon.x className='h-4 w-4 text-muted-foreground' />}
										<Text
											variant='sm/normal'
											className={
												chargesEnabled ? 'text-muted-foreground line-through' : ''
											}
										>
											Connect Stripe for payment processing
										</Text>
									</div>
									<div className='flex items-center gap-2'>
										{hasAddress ?
											<Icon.check className='h-4 w-4 text-green-600' />
										:	<Icon.x className='h-4 w-4 text-muted-foreground' />}
										<Text
											variant='sm/normal'
											className={hasAddress ? 'text-muted-foreground line-through' : ''}
										>
											Add your company address
										</Text>
									</div>
									<div className='flex items-center gap-2'>
										{hasSupportEmail ?
											<Icon.check className='h-4 w-4 text-green-600' />
										:	<Icon.x className='h-4 w-4 text-muted-foreground' />}
										<Text
											variant='sm/normal'
											className={
												hasSupportEmail ? 'text-muted-foreground line-through' : ''
											}
										>
											Set an invoice support email
										</Text>
									</div>
								</div>
							</div>
						</Card>
					)}

					<InvoiceCompanyAddressForm />

					<InvoiceSupportEmailForm />

					{/* Stripe Connect Status */}
					<Card>
						<div className='flex flex-col gap-4 p-4'>
							<div className='flex flex-row items-center gap-2'>
								<H size='5'>Payment Processing</H>
							</div>
							<Text variant='sm/normal'>
								Stripe Connect is used to process invoice payments securely.
							</Text>
							<div className='flex items-center gap-2'>
								<Icon.creditCard className='h-4 w-4 text-muted-foreground' />
								<Text variant='sm/normal'>Status:</Text>
								{chargesEnabled ?
									<Badge variant='success'>Connected</Badge>
								:	<Badge variant='danger'>Not Connected</Badge>}
							</div>
							{!chargesEnabled && (
								<Text variant='sm/normal' className='text-muted-foreground'>
									Visit your workspace&apos;s Financials settings to set up Stripe Connect
									before sending invoices.
								</Text>
							)}
						</div>
					</Card>
				</div>
			</DashContent>
		</>
	);
}

function InvoiceCompanyAddressForm() {
	const workspace = useWorkspaceWithAll();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			invoiceAddressLine1: workspace.invoiceAddressLine1 ?? '',
			invoiceAddressLine2: workspace.invoiceAddressLine2 ?? '',
			invoiceAddressCity: workspace.invoiceAddressCity ?? '',
			invoiceAddressState: workspace.invoiceAddressState ?? '',
			invoiceAddressPostalCode: workspace.invoiceAddressPostalCode ?? '',
			invoiceAddressCountry: workspace.invoiceAddressCountry ?? '',
		},
		resetOptions: { keepDirtyValues: true },
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
			title='Company Address'
			subtitle='This address will appear on your invoices. Make sure it matches your business registration.'
			disableSubmit={!form.formState.isDirty}
			formHint='This information is displayed on all invoices'
		>
			<div className='space-y-4'>
				<TextField
					control={form.control}
					name='invoiceAddressLine1'
					label='Address Line 1'
					placeholder='123 Main St'
				/>
				<TextField
					control={form.control}
					name='invoiceAddressLine2'
					label='Address Line 2'
					placeholder='Suite 100 (optional)'
				/>
				<div className='grid gap-4 md:grid-cols-2'>
					<TextField
						control={form.control}
						name='invoiceAddressCity'
						label='City'
						placeholder='City'
					/>
					<TextField
						control={form.control}
						name='invoiceAddressState'
						label='State / Region'
						placeholder='State'
					/>
				</div>
				<div className='grid gap-4 md:grid-cols-2'>
					<TextField
						control={form.control}
						name='invoiceAddressPostalCode'
						label='Postal Code'
						placeholder='12345'
					/>
					<TextField
						control={form.control}
						name='invoiceAddressCountry'
						label='Country'
						placeholder='US'
					/>
				</div>
			</div>
		</SettingsCardForm>
	);
}

function InvoiceSupportEmailForm() {
	const workspace = useWorkspaceWithAll();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			invoiceSupportEmail: workspace.invoiceSupportEmail ?? '',
		},
		resetOptions: { keepDirtyValues: true },
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
			title='Invoice Support Email'
			subtitle='This email will be used as the reply-to address when sending invoices. If not set, your workspace support email will be used instead.'
			disableSubmit={!form.formState.isDirty}
			formHint='Clients will see this as your contact email'
		>
			<TextField
				control={form.control}
				name='invoiceSupportEmail'
				label='Support Email'
				type='email'
				placeholder='invoices@yourcompany.com'
			/>
		</SettingsCardForm>
	);
}
