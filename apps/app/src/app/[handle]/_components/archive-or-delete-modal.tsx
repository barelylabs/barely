import type { api } from '@barely/lib/server/api/react';
import type { CommonKeys } from '@barely/lib/utils/types';
import type { Icon } from '@barely/ui/elements/icon';
import type { Selection } from 'react-aria-components';

import { Button } from '@barely/ui/elements/button';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/elements/modal';

export function ArchiveOrDeleteModal<T extends { id: string; name: string }>({
	mode,
	selection,
	lastSelected,
	showModal,
	setShowModal,
	archiveItems,
	deleteItems,
	isPendingArchive,
	isPendingDelete,
	itemName,
}: {
	mode: 'archive' | 'delete';
	selection: Selection; // Replace 'any' with the appropriate type for your item selection
	lastSelected: T | undefined; // Replace 'any' with the appropriate type for your last selected item
	showModal: boolean;
	setShowModal: (show: boolean) => void;
	archiveItems: (selection: string[]) => void; // Replace 'any' with the appropriate mutation type
	isPendingArchive: boolean;
	deleteItems: (selection: string[]) => void; // Replace 'any' with the appropriate mutation type
	isPendingDelete: boolean;
	itemName: keyof CommonKeys<typeof Icon, typeof api>;
}) {
	const mutate = mode === 'archive' ? archiveItems : deleteItems;
	const isPending = mode === 'archive' ? isPendingArchive : isPendingDelete;

	if (!lastSelected) return null;

	const title =
		mode === 'archive' ?
			selection === 'all' ?
				`Archive all ${itemName}s?`
			:	`Archive "${lastSelected?.name}" ${selection.size > 1 ? `and ${selection.size - 1} other ${itemName}?` : ''}`
		: selection === 'all' ? `Delete all ${itemName}s?`
		: `Delete "${lastSelected?.name}" ${selection.size > 1 ? `and ${selection.size - 1} other ${itemName}?` : ''}`;

	const subtitle =
		mode === 'archive' ?
			`Archived ${itemName}s will still work - they just won't show up on your main dashboard.`
		:	`Deleted ${itemName}s will be permanently removed from your account.`;

	return (
		<Modal showModal={showModal} setShowModal={setShowModal} className='h-fit max-w-md'>
			<ModalHeader icon={itemName} title={title} subtitle={subtitle} />
			<ModalBody>
				<Button
					onClick={() => {
						if (selection === 'all') {
							// todo: implement action for all items
						} else {
							mutate(Array.from(selection).map(id => id.toString()));
						}
					}}
					loading={isPending}
					look={mode === 'delete' ? 'destructive' : undefined}
					fullWidth
				>
					Confirm {mode}
				</Button>
			</ModalBody>
		</Modal>
	);
}
