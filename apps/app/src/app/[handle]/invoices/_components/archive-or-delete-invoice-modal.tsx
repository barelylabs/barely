'use client';

import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@barely/ui/dialog';

import {
	useInvoice,
	useInvoiceSearchParams,
} from '~/app/[handle]/invoices/_components/invoice-context';

interface ArchiveOrDeleteInvoiceModalProps {
	mode: 'archive' | 'delete';
}

export function ArchiveOrDeleteInvoiceModal({ mode }: ArchiveOrDeleteInvoiceModalProps) {
	const trpc = useTRPC();
	const utils = trpc.useUtils();
	const { selection, clearSelection } = useInvoice();
	const { showArchiveModal, showDeleteModal, setShowArchiveModal, setShowDeleteModal } =
		useInvoiceSearchParams();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;
	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const { mutate: archiveInvoices, isPending: isArchiving } = useMutation({
		...trpc.invoice.archive.mutationOptions(),
		onSuccess: () => {
			toast.success('Invoice(s) archived successfully');
			utils.invoice.byWorkspace.invalidate();
			clearSelection();
			setShowModal(false);
		},
		onError: error => {
			toast.error(error.message || 'Failed to archive invoice(s)');
		},
	});

	const { mutate: deleteInvoices, isPending: isDeleting } = useMutation({
		...trpc.invoice.delete.mutationOptions(),
		onSuccess: () => {
			toast.success('Invoice(s) deleted successfully');
			utils.invoice.byWorkspace.invalidate();
			clearSelection();
			setShowModal(false);
		},
		onError: error => {
			toast.error(error.message || 'Failed to delete invoice(s)');
		},
	});

	const handleConfirm = useCallback(() => {
		const ids = Array.from(selection);
		if (mode === 'archive') {
			archiveInvoices({ ids });
		} else {
			deleteInvoices({ ids });
		}
	}, [mode, selection, archiveInvoices, deleteInvoices]);

	return (
		<Dialog open={showModal} onOpenChange={setShowModal}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === 'archive' ? 'Archive' : 'Delete'} Invoice
						{selection.size > 1 ? 's' : ''}
					</DialogTitle>
					<DialogDescription>
						{mode === 'archive' ?
							<>
								Are you sure you want to archive {selection.size} invoice
								{selection.size > 1 ? 's' : ''}? You can restore archived invoices later.
							</>
						:	<>
								Are you sure you want to delete {selection.size} invoice
								{selection.size > 1 ? 's' : ''}? This action cannot be undone.
							</>
						}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button look='ghost' onClick={() => setShowModal(false)}>
						Cancel
					</Button>
					<Button
						look={mode === 'delete' ? 'destructive' : 'primary'}
						onClick={handleConfirm}
						disabled={isArchiving || isDeleting}
					>
						{isArchiving || isDeleting ?
							'Processing...'
						: mode === 'archive' ?
							'Archive'
						:	'Delete'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
