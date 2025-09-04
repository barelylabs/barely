'use client';

import type { InvoiceLineItem } from '@barely/validators';
import { cn } from '@barely/utils';

import { InvoiceRender } from '@barely/ui/invoice';

interface InvoicePreviewProps {
	formData: {
		clientId: string;
		invoiceNumber: string;
		poNumber?: string;
		lineItems: {
			description: string;
			quantity: number;
			unitPrice: number;
		}[];
		hasTax: boolean;
		taxPercentage: number;
		invoiceDate: Date;
		dueDate: Date;
		payerMemo?: string;
	};
	client?: {
		name: string;
		email: string;
		company?: string | null;
		address?: string | null;
		phone?: string | null;
	};
	workspace: {
		name: string;
		handle: string;
		email?: string;
		address?: string;
		currency?: string;
		logo?: string;
	};
	className?: string;
}

export function InvoicePreview({
	formData,
	client,
	workspace,
	className,
}: InvoicePreviewProps) {
	// Convert form data to invoice format
	const lineItems: InvoiceLineItem[] = formData.lineItems
		.filter(item => item.description && item.quantity > 0 && item.unitPrice > 0)
		.map(item => ({
			description: item.description,
			quantity: item.quantity,
			rate: Math.round(item.unitPrice * 100), // Convert to minor units
			amount: Math.round(item.quantity * item.unitPrice * 100), // Convert to minor units
		}));

	const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
	const taxAmount =
		formData.hasTax ? Math.round((subtotal * formData.taxPercentage) / 100) : 0;
	const total = subtotal + taxAmount;

	// Create preview invoice object
	const previewInvoice = {
		id: 'preview',
		invoiceNumber: formData.invoiceNumber,
		poNumber: formData.poNumber ?? null,
		status: 'created' as const,
		subtotal,
		tax: formData.hasTax ? formData.taxPercentage * 100 : 0, // Store as basis points
		total,
		dueDate: formData.dueDate,
		createdAt: formData.invoiceDate,
		lineItems,
		notes: null,
		payerMemo: formData.payerMemo ?? null,
	};

	// Default client if not selected
	const displayClient = client ?? {
		name: 'Select a client',
		email: 'client@example.com',
		company: null,
		address: null,
		phone: null,
	};

	return (
		<div className={cn('relative', className)}>
			{/* Preview Label */}
			<div className='absolute -top-3 right-4 z-10 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white'>
				Live Preview
			</div>

			{/* Phone Frame Wrapper */}
			<div className='mx-auto max-w-2xl overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100 shadow-xl'>
				<div className='h-[600px] overflow-y-auto bg-white'>
					<InvoiceRender
						invoice={previewInvoice}
						workspace={workspace}
						client={displayClient}
						isPreview={true}
					/>
				</div>
			</div>
		</div>
	);
}
