'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import {
	useInvoice,
	useInvoiceSearchParams,
} from '~/app/[handle]/invoices/_components/invoice-context';

interface ArchiveOrDeleteInvoiceModalProps {
	mode: 'archive' | 'delete';
}

export function ArchiveOrDeleteInvoiceModal({ mode }: ArchiveOrDeleteInvoiceModalProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { selection, lastSelectedItem } = useInvoice();
	const { showArchiveModal, showDeleteModal, setShowArchiveModal, setShowDeleteModal } =
		useInvoiceSearchParams();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;
	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const { mutate: archiveInvoices, isPending: isArchiving } = useMutation(
		trpc.invoice.archive.mutationOptions({
			onSuccess: async () => {
				toast.success('Invoice(s) archived successfully');
				await queryClient.invalidateQueries({
					queryKey: trpc.invoice.byWorkspace.queryKey(),
				});
				await setShowModal(false);
			},
			onError: error => {
				toast.error(error.message || 'Failed to archive invoice(s)');
			},
		}),
	);

	const { mutate: deleteInvoices, isPending: isDeleting } = useMutation({
		...trpc.invoice.delete.mutationOptions(),
		onSuccess: async () => {
			toast.success('Invoice(s) deleted successfully');
			await queryClient.invalidateQueries({
				queryKey: trpc.invoice.byWorkspace.queryKey(),
			});
			await setShowModal(false);
		},
		onError: error => {
			toast.error(error.message || 'Failed to delete invoice(s)');
		},
	});

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={{ ...lastSelectedItem, name: `Invoice #${lastSelectedItem.id}` }}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveInvoices}
			deleteItems={deleteInvoices}
			isPendingArchive={isArchiving}
			isPendingDelete={isDeleting}
			itemName='invoice'
		/>
	);
}
