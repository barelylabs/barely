'use client';

import type {
	Invoice,
	InvoiceClient,
	InvoiceLineItem,
	Workspace,
} from '@barely/validators';
import React from 'react';
import { cn, formatMinorToMajorCurrency } from '@barely/utils';
import { format } from 'date-fns';

import { Badge } from '../elements/badge';
import { Text } from '../elements/typography';

export interface InvoiceRenderProps {
	invoice: Pick<
		Invoice,
		| 'id'
		| 'invoiceNumber'
		| 'poNumber'
		| 'status'
		| 'subtotal'
		| 'tax'
		| 'total'
		| 'dueDate'
		| 'createdAt'
		| 'lineItems'
		| 'notes'
		| 'payerMemo'
	>;

	workspace: Pick<
		Workspace,
		| 'name'
		| 'handle'
		| 'shippingAddressLine1'
		| 'shippingAddressLine2'
		| 'shippingAddressCity'
		| 'shippingAddressState'
		| 'shippingAddressPostalCode'
		| 'shippingAddressCountry'
		| 'currency'
		| 'supportEmail'
		| 'invoiceSupportEmail'
		| 'invoiceAddressLine1'
		| 'invoiceAddressLine2'
		| 'invoiceAddressCity'
		| 'invoiceAddressState'
		| 'invoiceAddressPostalCode'
		| 'invoiceAddressCountry'
	>;

	client: Pick<
		InvoiceClient,
		| 'name'
		| 'email'
		| 'company'
		| 'addressLine1'
		| 'addressLine2'
		| 'city'
		| 'state'
		| 'postalCode'
		| 'country'
	>;
	isPreview?: boolean;
	isPdfMode?: boolean; // New prop for PDF-specific optimizations
	className?: string;
}

export function InvoiceRender({
	invoice,
	workspace,
	client,
	isPreview = false,
	isPdfMode = false,
	className,
}: InvoiceRenderProps) {
	// Parse line items if they're a string
	const lineItems = (
		typeof invoice.lineItems === 'string' ? JSON.parse(invoice.lineItems)
		: Array.isArray(invoice.lineItems) ? invoice.lineItems
		: []) as InvoiceLineItem[];

	const currency = workspace.currency;

	// Calculate tax amount
	const taxAmount = Math.round((invoice.subtotal * invoice.tax) / 10000);

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'overdue':
				return 'danger';
			case 'paid':
				return 'success';
			case 'voided':
				return 'outline';
			default:
				return 'secondary';
		}
	};

	// Format dates
	const invoiceDate =
		typeof invoice.createdAt === 'string' ?
			new Date(invoice.createdAt)
		:	invoice.createdAt;
	const dueDate =
		typeof invoice.dueDate === 'string' ? new Date(invoice.dueDate) : invoice.dueDate;

	const addressLine1 = workspace.invoiceAddressLine1 ?? workspace.shippingAddressLine1;
	const addressLine2 = workspace.invoiceAddressLine2 ?? workspace.shippingAddressLine2;
	const addressCity = workspace.invoiceAddressCity ?? workspace.shippingAddressCity;
	const addressState = workspace.invoiceAddressState ?? workspace.shippingAddressState;
	const addressPostalCode =
		workspace.invoiceAddressPostalCode ?? workspace.shippingAddressPostalCode;
	const addressCountry =
		workspace.invoiceAddressCountry ?? workspace.shippingAddressCountry;

	return (
		<div
			className={cn(
				'flex min-h-screen flex-col',
				isPdfMode ? 'px-0 py-0' : 'px-10',
				className,
			)}
		>
			{/* Header */}
			<div className={isPdfMode ? 'py-0' : 'py-6'}>
				<div className='border-b pb-6'>
					<div className='flex items-start justify-between'>
						<div>
							<Text variant='2xl/semibold' className='text-gray-900'>
								Invoice
							</Text>
							<div className='mt-1 flex items-center gap-3'>
								<Text variant='lg/normal' className='text-gray-600'>
									{invoice.invoiceNumber}
								</Text>
								{!isPdfMode && ['overdue', 'paid', 'voided'].includes(invoice.status) && (
									<Badge variant={getStatusColor(invoice.status)} className='text-xs'>
										{invoice.status.toUpperCase()}
									</Badge>
								)}
								{/* For PDF mode, show status as text instead of badge */}
								{isPdfMode && ['overdue', 'paid', 'voided'].includes(invoice.status) && (
									<Text variant='sm/medium' className='text-gray-700'>
										[{invoice.status.toUpperCase()}]
									</Text>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* From/To Section */}
			<div className='grid grid-cols-2 gap-8 py-6'>
				<div>
					<Text variant='xs/semibold' className='uppercase tracking-wide text-gray-500'>
						From
					</Text>
					<div className='mt-3 space-y-1'>
						<Text variant='md/semibold' className='text-gray-900'>
							{workspace.name}
						</Text>
						{workspace.supportEmail && (
							<Text variant='sm/normal' className='text-gray-600'>
								{workspace.supportEmail}
							</Text>
						)}
						{/* Use invoice address with fallback to shipping address */}
						{addressLine1 && (
							<div className='space-y-1'>
								<Text variant='sm/normal' className='text-gray-600'>
									{addressLine1}
									{addressLine2 && (
										<Text variant='sm/normal' className='text-gray-600'>
											{addressLine2}
										</Text>
									)}
								</Text>
								{addressLine2 && (
									<Text variant='sm/normal' className='text-gray-600'>
										{addressLine2}
									</Text>
								)}
								{addressCity && (
									<Text variant='sm/normal' className='text-gray-600'>
										{addressCity}, {addressState} {addressPostalCode}
									</Text>
								)}
								{addressCountry && (
									<Text variant='sm/normal' className='text-gray-600'>
										{addressCountry}
									</Text>
								)}
							</div>
						)}
					</div>
				</div>

				<div>
					<Text variant='xs/semibold' className='uppercase tracking-wide text-gray-500'>
						To
					</Text>
					<div className='mt-3 space-y-1'>
						{client.name ?
							<Text variant='md/semibold' className='text-gray-900'>
								{client.name}
							</Text>
						: isPreview ?
							<div className='h-5 w-32 rounded bg-gray-200'></div>
						:	null}
						{client.company && (
							<Text variant='sm/normal' className='text-gray-600'>
								{client.company}
							</Text>
						)}
						{client.email ?
							<Text variant='sm/normal' className='text-gray-600'>
								{client.email}
							</Text>
						: isPreview ?
							<div className='h-4 w-40 rounded bg-gray-200'></div>
						:	null}
						{/* Use individual address fields with fallback to deprecated address field */}
						{client.addressLine1 ?
							<div className='space-y-1'>
								<>
									<Text variant='sm/normal' className='text-gray-600'>
										{client.addressLine1}
									</Text>
									{client.addressLine2 && (
										<Text variant='sm/normal' className='text-gray-600'>
											{client.addressLine2}
										</Text>
									)}
									{client.city && (
										<Text variant='sm/normal' className='text-gray-600'>
											{client.city}
											{client.state && `, ${client.state}`}
											{client.postalCode && ` ${client.postalCode}`}
										</Text>
									)}
									{client.country && (
										<Text variant='sm/normal' className='text-gray-600'>
											{client.country}
										</Text>
									)}
								</>
							</div>
						: isPreview ?
							<div className='space-y-1'>
								<div className='h-4 w-36 rounded bg-gray-200'></div>
								<div className='h-4 w-28 rounded bg-gray-200'></div>
							</div>
						:	null}
					</div>
				</div>
			</div>

			{/* Invoice Details */}
			<div className='py-6'>
				<div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
					<div>
						<Text variant='xs/semibold' className='uppercase tracking-wide text-gray-500'>
							Invoice No.
						</Text>
						<Text variant='sm/medium' className='mt-1 text-gray-900'>
							{invoice.invoiceNumber}
						</Text>
					</div>
					{invoice.poNumber && (
						<div>
							<Text
								variant='xs/semibold'
								className='uppercase tracking-wide text-gray-500'
							>
								PO No.
							</Text>
							<Text variant='sm/medium' className='mt-1 text-gray-900'>
								{invoice.poNumber}
							</Text>
						</div>
					)}
					<div>
						<Text variant='xs/semibold' className='uppercase tracking-wide text-gray-500'>
							Invoice Date
						</Text>
						<Text variant='sm/medium' className='mt-1 text-gray-900'>
							{format(invoiceDate, 'dd/MM/yyyy')}
						</Text>
					</div>
					<div>
						<Text variant='xs/semibold' className='uppercase tracking-wide text-gray-500'>
							Due Date
						</Text>
						<Text variant='sm/medium' className='mt-1 text-gray-900'>
							{format(dueDate, 'dd/MM/yyyy')}
						</Text>
					</div>
				</div>
			</div>

			{/* Line Items */}
			<div className=''>
				<div className='overflow-hidden rounded-lg border'>
					<table className='w-full table-fixed'>
						<colgroup>
							<col className='w-auto' />
							<col className='w-20' />
							<col className='w-24' />
							<col className='w-24' />
						</colgroup>
						<thead className='bg-gray-50'>
							<tr>
								<th className='px-4 py-3 text-left'>
									<Text variant='xs/semibold' className='uppercase text-gray-600'>
										Item
									</Text>
								</th>
								<th className='w-20 px-4 py-3 text-right'>
									<Text variant='xs/semibold' className='uppercase text-gray-600'>
										Quantity
									</Text>
								</th>
								<th className='w-24 px-4 py-3 text-right'>
									<Text variant='xs/semibold' className='uppercase text-gray-600'>
										Unit Price
									</Text>
								</th>
								<th className='w-24 px-4 py-3 text-right'>
									<Text variant='xs/semibold' className='uppercase text-gray-600'>
										Total
									</Text>
								</th>
							</tr>
						</thead>
						<tbody className='divide-y'>
							{lineItems.map((item, index) => (
								<tr key={index}>
									<td className='px-4 py-3'>
										{item.description ?
											<Text variant='sm/normal' className='text-gray-900'>
												{item.description}
											</Text>
										: isPreview ?
											<div className='h-4 w-32 rounded bg-gray-200'></div>
										:	null}
									</td>
									<td className='px-4 py-3 text-right'>
										<Text variant='sm/normal' className='text-gray-900'>
											{item.quantity}
										</Text>
									</td>
									<td className='px-4 py-3 text-right'>
										{item.rate > 0 ?
											<Text variant='sm/normal' className='text-gray-900'>
												{formatMinorToMajorCurrency(item.rate, currency)}
											</Text>
										: isPreview ?
											<div className='ml-auto h-4 w-16 rounded bg-gray-200'></div>
										:	null}
									</td>
									<td className='px-4 py-3 text-right'>
										{item.amount > 0 ?
											<Text variant='sm/medium' className='text-gray-900'>
												{formatMinorToMajorCurrency(item.amount, currency)}
											</Text>
										: isPreview ?
											<div className='ml-auto h-4 w-16 rounded bg-gray-200'></div>
										:	null}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Total Section */}
			<div className='py-6'>
				<div className='ml-auto max-w-sm space-y-2'>
					<div className='flex justify-between'>
						<Text variant='sm/normal' className='text-gray-600'>
							Subtotal
						</Text>
						<Text variant='sm/normal' className='text-gray-900'>
							{formatMinorToMajorCurrency(invoice.subtotal, currency)}
						</Text>
					</div>
					{invoice.tax > 0 && (
						<div className='flex justify-between'>
							<Text variant='sm/normal' className='text-gray-600'>
								Tax ({(invoice.tax / 100).toFixed(2)}%)
							</Text>
							<Text variant='sm/normal' className='text-gray-900'>
								{formatMinorToMajorCurrency(taxAmount, currency)}
							</Text>
						</div>
					)}
					<div className='border-t pt-2'>
						<div className='flex justify-between'>
							<Text variant='md/semibold' className='text-gray-900'>
								Total
							</Text>
							<Text variant='md/semibold' className='text-gray-900'>
								{formatMinorToMajorCurrency(invoice.total, currency)}
							</Text>
						</div>
					</div>
				</div>
			</div>

			{/* Terms and Memo */}
			{(invoice.notes ?? invoice.payerMemo) && (
				<div className='border-t py-6'>
					<div className='grid gap-6 md:grid-cols-2'>
						{invoice.notes && (
							<div>
								<Text
									variant='xs/semibold'
									className='uppercase tracking-wide text-gray-500'
								>
									Terms
								</Text>
								<Text
									variant='sm/normal'
									className='mt-2 whitespace-pre-line text-gray-600'
								>
									{invoice.notes}
								</Text>
							</div>
						)}
						{invoice.payerMemo && (
							<div>
								<Text
									variant='xs/semibold'
									className='uppercase tracking-wide text-gray-500'
								>
									Memo
								</Text>
								<Text
									variant='sm/normal'
									className='mt-2 whitespace-pre-line text-gray-600'
								>
									{invoice.payerMemo}
								</Text>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Spacer to push footer to bottom */}
			<div className='flex-grow'></div>

			{/* Payment Terms - Footer */}
			<div className='mt-auto py-6 print:pb-0'>
				<div className={cn('border-t pt-6')}>
					<div className='flex flex-row items-center justify-center gap-2 text-gray-500'>
						<p
							className='font-heading'
							style={{
								fontSize: '12px',
								marginBottom: '1px',
							}}
						>
							Barely Invoice
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
