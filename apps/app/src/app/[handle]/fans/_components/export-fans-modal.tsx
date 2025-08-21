'use client';

import { useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';
import { Label } from '@barely/ui/label';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';
import { RadioGroup, RadioGroupItem } from '@barely/ui/radio-group';
import { Text } from '@barely/ui/typography';

import { useFanSearchParams } from '~/app/[handle]/fans/_components/fan-context';

type ExportFormat = 'generic' | 'mailchimp' | 'klaviyo' | 'constantcontact';

const formatDescriptions: Record<ExportFormat, string> = {
	generic: 'Universal CSV format with all fan data',
	mailchimp: 'Optimized for Mailchimp import with proper field mapping',
	klaviyo: 'Formatted for Klaviyo with marketing consent fields',
	constantcontact: 'Compatible with Constant Contact import requirements',
};

export function ExportFansModal() {
	const { handle } = useWorkspace();
	const searchParams = useFanSearchParams();
	const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('generic');
	const trpc = useTRPC();

	const exportMutation = useMutation(
		trpc.fan.exportToCsv.mutationOptions({
			onSuccess: data => {
				// Create a blob from the CSV content
				const blob = new Blob([data.csvContent], {
					type: 'text/csv;charset=utf-8;',
				});

				// Create a temporary download link
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = data.filename;

				// Trigger the download
				document.body.appendChild(link);
				link.click();

				// Clean up
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);

				toast.success(`Exported ${data.totalRecords.toLocaleString()} fans successfully`);
				void searchParams.setShowExportModal(false);
			},
			onError: error => {
				console.error('Export failed:', error);

				// Check if it's a too many fans error
				if (error.message.includes('Export limited to')) {
					toast.error(error.message);
				} else {
					toast.error('Failed to export fans. Please try again.');
				}
			},
		}),
	);

	const handleExport = () => {
		exportMutation.mutate({
			handle,
			format: selectedFormat,
			filters: {
				search: searchParams.filters.search,
				showArchived: searchParams.filters.showArchived,
			},
			includeArchived: searchParams.filters.showArchived || false,
		});
	};

	if (!searchParams.filters.showExportModal) return null;

	return (
		<Modal className='max-w-md'>
			<ModalHeader>
				<div className='flex items-center gap-2'>
					<Icon.download className='h-5 w-5' />
					<span>Export Fans</span>
				</div>
			</ModalHeader>
			<ModalBody>
				<div className='flex flex-col gap-6'>
					<Text variant='sm/normal' className='text-muted-foreground'>
						Download your fan list as a CSV file for use in email marketing services.
					</Text>

					<div className='flex flex-col gap-4'>
						<div className='flex flex-col gap-3'>
							<Label>Export Format</Label>
							<RadioGroup
								value={selectedFormat}
								onValueChange={value => setSelectedFormat(value as ExportFormat)}
							>
								{Object.entries(formatDescriptions).map(([format, description]) => (
									<div key={format} className='flex items-start space-x-3'>
										<RadioGroupItem value={format} id={format} className='mt-1' />
										<Label
											htmlFor={format}
											className='flex cursor-pointer flex-col gap-1 font-normal'
										>
											<span className='font-medium capitalize'>
												{format === 'constantcontact' ? 'Constant Contact' : format}
											</span>
											<Text variant='xs/normal' className='text-muted-foreground'>
												{description}
											</Text>
										</Label>
									</div>
								))}
							</RadioGroup>
						</div>

						{(searchParams.filters.search || searchParams.filters.showArchived) && (
							<div className='rounded-md bg-muted/50 p-3'>
								<Text variant='sm/normal'>
									<span className='font-medium'>Active filters:</span>
									{searchParams.filters.search && (
										<span className='mt-1 block'>
											Search: "{searchParams.filters.search}"
										</span>
									)}
									{searchParams.filters.showArchived && (
										<span className='mt-1 block'>Including archived fans</span>
									)}
								</Text>
							</div>
						)}
					</div>

					<div className='flex justify-end gap-3'>
						<Button
							look='ghost'
							onClick={() => searchParams.setShowExportModal(false)}
							disabled={exportMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleExport}
							loading={exportMutation.isPending}
							startIcon='download'
						>
							{exportMutation.isPending ? 'Exporting...' : 'Export'}
						</Button>
					</div>
				</div>
			</ModalBody>
		</Modal>
	);
}
