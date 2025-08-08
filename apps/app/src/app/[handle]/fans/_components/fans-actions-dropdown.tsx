'use client';

import { Button } from '@barely/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@barely/ui/dropdown-menu';
import { Icon } from '@barely/ui/icon';

import { useFanSearchParams } from '~/app/[handle]/fans/_components/fan-context';

export function FansActionsDropdown() {
	const { setShowExportModal, setShowImportModal } = useFanSearchParams();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button look='secondary' variant='icon' size='sm'>
					<Icon.moreVertical className='h-4 w-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem
					onClick={() => {
						void setShowImportModal(true);
					}}
				>
					<Icon.import className='mr-2 h-4 w-4' />
					Import Fans
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						void setShowExportModal(true);
					}}
				>
					<Icon.download className='mr-2 h-4 w-4' />
					Export Fans
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
