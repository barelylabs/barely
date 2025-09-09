'use client';

import type { InvoiceClient, InvoiceLineItem, Workspace } from '@barely/validators';
import { useWorkspaceWithAll } from '@barely/hooks';
import { cn, handleCurrencyMinorStringOrMajorNumber } from '@barely/utils';

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
	client?: Pick<
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
	workspace: Pick<
		Workspace,
		| 'name'
		| 'handle'
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

	className?: string;
}

export function InvoicePreview({ formData, client, className }: InvoicePreviewProps) {
	const workspace = useWorkspaceWithAll();
	// Convert form data to invoice format - include items with empty descriptions/prices for skeleton display
	const lineItems: InvoiceLineItem[] = formData.lineItems.map(item => {
		const quantity = item.quantity || 1;
		const rate = handleCurrencyMinorStringOrMajorNumber(item.unitPrice || 0);
		return {
			description: item.description || '', // Include empty descriptions for skeleton display
			quantity,
			rate,
			amount: quantity * rate,
		};
	});

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

	// Create skeleton placeholders for client data
	const displayClient = client ?? {
		name: '', // Will show skeleton
		email: '', // Will show skeleton
		company: '',
		address: '',
		addressLine1: '',
		addressLine2: '',
		city: '',
		state: '',
		postalCode: '',
		country: '',
	};

	return (
		<div className={cn('relative', className)}>
			{/* Preview Label */}
			<div className='absolute -top-3 right-20 z-10 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white'>
				Live Preview
			</div>

			{/* Paper Frame Wrapper with 8.5x11 aspect ratio */}
			<div className='mx-auto max-w-2xl'>
				{/* 8.5x11 aspect ratio container */}
				<div
					className='overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100 shadow-xl'
					style={{ aspectRatio: '8.5 / 11' }}
				>
					<div className='h-full overflow-y-auto bg-white'>
						<InvoiceRender
							invoice={previewInvoice}
							workspace={workspace}
							client={displayClient}
							isPreview={true}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
