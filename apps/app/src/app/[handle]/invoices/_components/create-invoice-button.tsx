'use client';

import { useParams } from 'next/navigation';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';

export function CreateInvoiceButton() {
	const params = useParams();
	const handle = params.handle as string;

	return (
		<Button href={`/${handle}/invoices/new`}>
			<Icon.plus className='mr-2 h-4 w-4' />
			New Invoice
		</Button>
	);
}
