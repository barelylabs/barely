'use client';

import type { UploadQueueItem } from '@barely/hooks';
import type { SelectFieldOption } from '@barely/ui/forms/select-field';
import type { z } from 'zod/v4';
import { useMemo, useState } from 'react';
import { useUpload, useZodForm } from '@barely/hooks';
import { useToast } from '@barely/toast';
import { raise } from '@barely/utils';
import { importFansFromCsvSchema } from '@barely/validators';
import { useMutation } from '@tanstack/react-query';
import { atom } from 'jotai';
import Papa from 'papaparse';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { Icon } from '@barely/ui/icon';
import { LoadingSpinner } from '@barely/ui/loading';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';
import { Text } from '@barely/ui/typography';
import { UploadDropzone } from '@barely/ui/upload';

import { useFanSearchParams } from '~/app/[handle]/fans/_components/fan-context';

const csvUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function ImportFansFromCsvModal() {
	const { toast } = useToast();

	const trpc = useTRPC();
	const { showImportModal: showModal, setShowImportModal: setShowModal } =
		useFanSearchParams();

	const { mutate: importFansFromCsv } = useMutation({
		...trpc.fan.importFromCsv.mutationOptions(),
		onSuccess: async () => {
			await handleCloseModal();
			toast('Fans importing...check back in a bit');
		},
	});

	const form = useZodForm({
		schema: importFansFromCsvSchema,
		defaultValues: {
			// csvFileId: '',
			// fixme: make these form fields
			optIntoEmailMarketing: true,
			optIntoSmsMarketing: false,
		},
	});
	const { control, setValue } = form;

	const [generatingMapping, setGeneratingMapping] = useState(false);

	const { mutate: generateCsvMapping } = useMutation({
		...trpc.fan.generateCsvMapping.mutationOptions(),
		onSuccess: data => {
			const { email, firstName, lastName, fullName, phoneNumber, createdAt } = data;
			console.log(data);
			setValue('email', email);
			setValue('firstName', firstName);
			setValue('lastName', lastName);
			setValue('fullName', fullName);
			setValue('phoneNumber', phoneNumber);
			setValue('createdAt', createdAt);
			setGeneratingMapping(false);
		},
	});

	const [fileColumns, setFileColumns] = useState<string[] | null>(null);
	const columnOptions = useMemo(() => {
		const options: SelectFieldOption<string>[] =
			fileColumns?.map(column => ({
				label: column,
				value: column,
			})) ?? [];

		return options;
	}, [fileColumns]);

	const [, setFileError] = useState<string | null>(null);

	const csvUploadState = useUpload({
		allowedFileTypes: ['text'],
		uploadQueueAtom: csvUploadQueueAtom,
		maxFiles: 1,
		folder: 'imports/fans',
		disabled: generatingMapping,
		onDropAccepted(files) {
			setGeneratingMapping(true);
			const file = files[0];
			if (!file) {
				return setGeneratingMapping(false);
			}

			readLines(file, 4)
				.then(lines => {
					const { data, meta } = Papa.parse<Record<string, string>>(lines, {
						header: true,
						worker: false,
						skipEmptyLines: true,
						dynamicTyping: true,
					});

					if (data.length < 2) {
						setFileError('CSV file must have at least 2 rows');
						setFileColumns(null);
						return setGeneratingMapping(false);
					}

					if (meta.fields?.length && meta.fields.length <= 1) {
						setFileError('Failed to retrieve CSV column data');
						setFileColumns(null);
						return setGeneratingMapping(false);
					}

					setFileColumns(meta.fields ?? []);

					generateCsvMapping({
						fieldColumns: meta.fields ?? [],
						firstRows: data,
					});
				})
				.catch(() => {
					setFileError('Failed to read CSV file');
					setFileColumns(null);
				});
		},
		onPresigned: data => {
			const csvFileId = data[0]?.fileRecord.id ?? raise('No CSV file id');
			setValue('csvFileId', csvFileId, { shouldDirty: true });
		},
	});

	const {
		isPendingPresigns,
		uploadQueue,
		setUploadQueue,
		handleSubmit: handleUpload,
	} = csvUploadState;

	const handleSubmit = async (data: z.infer<typeof importFansFromCsvSchema>) => {
		if (uploadQueue.length === 0) {
			return;
		}

		const csvFileId = uploadQueue[0]?.presigned?.fileRecord.id ?? raise('No CSV file id');

		await handleUpload();

		importFansFromCsv({
			...data,
			csvFileId,
		});
	};

	const submitDisabled = isPendingPresigns || uploadQueue.length === 0;

	const page =
		columnOptions.length > 0 && !generatingMapping ? 'confirm-import' : 'upload';

	const handleCloseModal = async () => {
		setUploadQueue([]);
		await setShowModal(false);
	};

	const preventDefaultClose = isPendingPresigns || uploadQueue.length > 0;

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			preventDefaultClose={preventDefaultClose}
			onClose={handleCloseModal}
			className='max-w-lg'
		>
			<ModalHeader icon={'fans'} title='Import Fans' />
			<ModalBody>
				{page === 'upload' && (
					<>
						<UploadDropzone {...csvUploadState} title='Upload CSV' />
						{generatingMapping && (
							<div className='flex flex-row items-center gap-2'>
								<LoadingSpinner />
								<Text>🤖 Generating mapping...</Text>
							</div>
						)}
					</>
				)}

				{page === 'confirm-import' && (
					<div className='flex w-full flex-col gap-2'>
						<Form form={form} onSubmit={handleSubmit}>
							<div className='mx-auto flex w-full flex-col gap-4'>
								<div className='grid w-full grid-cols-[1fr_min-content_1fr] items-center gap-2'>
									<SelectField
										control={control}
										name='email'
										options={columnOptions}
										placeholder='Select column...'
									/>
									<Icon.arrowRight className='h-4 w-4' />
									<FanPropertyText label='Email Address' required />

									<SelectField
										control={control}
										name='firstName'
										options={columnOptions}
										placeholder='Select column...'
									/>
									<Icon.arrowRight className='h-4 w-4' />
									<FanPropertyText label='First Name' />

									<SelectField
										control={control}
										name='lastName'
										options={columnOptions}
										placeholder='Select column...'
									/>
									<Icon.arrowRight className='h-4 w-4' />
									<FanPropertyText label='Last Name' />

									<SelectField
										control={control}
										name='fullName'
										options={columnOptions}
										placeholder='Select column...'
									/>
									<Icon.arrowRight className='h-4 w-4' />
									<FanPropertyText label='Full Name' />

									<SelectField
										control={control}
										name='phoneNumber'
										options={columnOptions}
										placeholder='Select column...'
									/>
									<Icon.arrowRight className='h-4 w-4' />
									<FanPropertyText label='Phone Number' />

									<SelectField
										control={control}
										name='createdAt'
										options={columnOptions}
										placeholder='Select column...'
									/>
									<Icon.arrowRight className='h-4 w-4' />
									<FanPropertyText label='Created At' />
								</div>

								<SubmitButton disabled={submitDisabled} fullWidth>
									Import Fans
								</SubmitButton>
							</div>
						</Form>
					</div>
				)}
			</ModalBody>
		</Modal>
	);
}

export function ImportFansButton() {
	const { setShowImportModal } = useFanSearchParams();

	return (
		<Button
			look='secondary'
			variant='icon'
			startIcon='import'
			onClick={() => {
				void setShowImportModal(true);
			}}
		/>
	);
}

export function FanPropertyText({
	label,
	required,
}: {
	label: string;
	required?: boolean;
}) {
	return (
		<div className='flex h-10 items-center rounded-md border border-border px-3'>
			<Text variant='sm/normal'>
				{label}
				{required && <span className='text-red-700'>*</span>}
			</Text>
		</div>
	);
}

const readLines = async (file: File, count = 4): Promise<string> => {
	const reader = file.stream().getReader();
	const decoder = new TextDecoder('utf-8');
	let { value: chunk, done: readerDone } = await reader.read();
	let content = '';

	while (!readerDone) {
		content += decoder.decode(chunk, { stream: true });
		const lines = content.split('\n');
		if (lines.length >= count) {
			await reader.cancel();
			return lines.slice(0, count).join('\n');
		}
		({ value: chunk, done: readerDone } = await reader.read());
	}

	return content.split('\n').slice(0, count).join('\n');
};
