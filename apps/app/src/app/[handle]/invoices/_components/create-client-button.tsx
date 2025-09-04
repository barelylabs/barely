'use client';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';

import { useClientSearchParams } from '~/app/[handle]/invoices/_components/client-context';

export function CreateClientButton() {
	const { setShowCreateModal } = useClientSearchParams();

	return (
		<Button onClick={() => setShowCreateModal(true)}>
			<Icon.plus className='mr-2 h-4 w-4' />
			New Client
		</Button>
	);
}
