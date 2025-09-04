'use client';

import type { InvoiceLineItem } from '@barely/validators';
import React from 'react';
import { cn, formatMinorToMajorCurrency } from '@barely/utils';
import { format } from 'date-fns';

import { Badge } from '../elements/badge';
import { Text } from '../elements/typography';

export interface InvoiceRenderProps {
	invoice: {
		id: string;
		invoiceNumber: string;
		poNumber?: string | null;
		status: 'created' | 'sent' | 'viewed' | 'paid' | 'voided';
		subtotal: number;
		tax: number;
		total: number;
		dueDate: string | Date;
		createdAt: string | Date;
		lineItems?: InvoiceLineItem[] | string;
		notes?: string | null;
		payerMemo?: string | null;
	};
	workspace: {
		name: string;
		handle?: string;
		email?: string;
		address?: string;
		currency?: string;
		logo?: string;
	};
	client: {
		name: string;
		email: string;
		company?: string | null;
		address?: string | null;
		phone?: string | null;
	};
	isPreview?: boolean;
	className?: string;
}

export function InvoiceRender({
	invoice,
	workspace,
	client,
	isPreview: _isPreview = false,
	className,
}: InvoiceRenderProps) {
	// Parse line items if they're a string
	const lineItems = (
		typeof invoice.lineItems === 'string' ? JSON.parse(invoice.lineItems)
		: Array.isArray(invoice.lineItems) ? invoice.lineItems
		: []) as InvoiceLineItem[];

	const currency = (workspace.currency ?? 'usd') as 'usd' | 'gbp';

	// Calculate tax amount
	const taxAmount = Math.round((invoice.subtotal * invoice.tax) / 10000);

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'created':
				return 'secondary';
			case 'sent':
				return 'info';
			case 'viewed':
				return 'warning';
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

	return (
		<div className={cn('bg-white', className)}>
			{/* Header */}
			<div className='border-b px-8 py-6'>
				<div className='flex items-start justify-between'>
					<div>
						<Text variant='2xl/semibold' className='text-gray-900'>
							Invoice
						</Text>
						<div className='mt-1 flex items-center gap-3'>
							<Text variant='lg/normal' className='text-gray-600'>
								{invoice.invoiceNumber}
							</Text>
							<Badge variant={getStatusColor(invoice.status)} className='text-xs'>
								{invoice.status.toUpperCase()}
							</Badge>
						</div>
					</div>
					{workspace.logo && (
						<img
							src={workspace.logo}
							alt={workspace.name}
							className='h-12 w-auto object-contain'
						/>
					)}
				</div>
			</div>

			{/* From/To Section */}
			<div className='grid grid-cols-2 gap-8 px-8 py-6'>
				<div>
					<Text variant='xs/semibold' className='uppercase tracking-wide text-gray-500'>
						From
					</Text>
					<div className='mt-3 space-y-1'>
						<Text variant='md/semibold' className='text-gray-900'>
							{workspace.name}
						</Text>
						{workspace.email && (
							<Text variant='sm/normal' className='text-gray-600'>
								{workspace.email}
							</Text>
						)}
						{workspace.address && (
							<Text variant='sm/normal' className='whitespace-pre-line text-gray-600'>
								{workspace.address}
							</Text>
						)}
					</div>
				</div>

				<div>
					<Text variant='xs/semibold' className='uppercase tracking-wide text-gray-500'>
						To
					</Text>
					<div className='mt-3 space-y-1'>
						<Text variant='md/semibold' className='text-gray-900'>
							{client.name}
						</Text>
						{client.company && (
							<Text variant='sm/normal' className='text-gray-600'>
								{client.company}
							</Text>
						)}
						<Text variant='sm/normal' className='text-gray-600'>
							{client.email}
						</Text>
						{client.phone && (
							<Text variant='sm/normal' className='text-gray-600'>
								{client.phone}
							</Text>
						)}
						{client.address && (
							<Text variant='sm/normal' className='whitespace-pre-line text-gray-600'>
								{client.address}
							</Text>
						)}
					</div>
				</div>
			</div>

			{/* Invoice Details */}
			<div className='px-8 py-6'>
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
			<div className='px-8'>
				<div className='overflow-hidden rounded-lg border'>
					<table className='w-full'>
						<thead className='bg-gray-50'>
							<tr>
								<th className='px-4 py-3 text-left'>
									<Text variant='xs/semibold' className='uppercase text-gray-600'>
										Item
									</Text>
								</th>
								<th className='px-4 py-3 text-center'>
									<Text variant='xs/semibold' className='uppercase text-gray-600'>
										Quantity
									</Text>
								</th>
								<th className='px-4 py-3 text-right'>
									<Text variant='xs/semibold' className='uppercase text-gray-600'>
										Unit Price
									</Text>
								</th>
								<th className='px-4 py-3 text-right'>
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
										<Text variant='sm/normal' className='text-gray-900'>
											{item.description}
										</Text>
									</td>
									<td className='px-4 py-3 text-center'>
										<Text variant='sm/normal' className='text-gray-900'>
											{item.quantity}
										</Text>
									</td>
									<td className='px-4 py-3 text-right'>
										<Text variant='sm/normal' className='text-gray-900'>
											{formatMinorToMajorCurrency(item.rate, currency)}
										</Text>
									</td>
									<td className='px-4 py-3 text-right'>
										<Text variant='sm/medium' className='text-gray-900'>
											{formatMinorToMajorCurrency(item.amount, currency)}
										</Text>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Total Section */}
			<div className='px-8 py-6'>
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
				<div className='border-t px-8 py-6'>
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

			{/* Payment Terms */}
			<div className='border-t px-8 py-6'>
				<Text variant='xs/normal' className='text-center text-gray-500'>
					Payment via{' '}
					{invoice.status === 'paid' ?
						'Manual transfer (ACH/Wire), Pay by Mercury'
					:	'Manual transfer (ACH/Wire), Pay by Mercury'}
				</Text>
			</div>
		</div>
	);
}
