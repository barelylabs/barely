'use client';

import type { OnUploadComplete } from '@barely/lib/files/client';
import type { UploadQueueItem } from '@barely/lib/hooks/use-upload';
import type { workspaceTypeSchema } from '@barely/lib/server/routes/workspace/workspace.schema';
import type { MDXEditorMethods } from '@barely/ui/elements/mdx-editor';
import type { SelectFieldOption } from '@barely/ui/forms/select-field';
import type { z } from 'zod/v4';
import { useCallback, useRef } from 'react';
import { useUpdateWorkspace } from '@barely/lib/hooks/use-update-workspace';
import { useUpload } from '@barely/lib/hooks/use-upload';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { updateWorkspaceSchema } from '@barely/lib/server/routes/workspace/workspace.schema';
import { api } from '@barely/server/api/react';
import { atom } from 'jotai';
import HuePicker from 'simple-hue-picker/react';

import { useWorkspace } from '@barely/hooks/use-workspace';

import { SettingsCard, SettingsCardForm } from '@barely/ui/components/settings-card';
import { Icon } from '@barely/ui/elements/icon';
import { MDXEditor } from '@barely/ui/elements/mdx-editor';
import { Text } from '@barely/ui/elements/typography';
import { UploadDropzone } from '@barely/ui/elements/upload';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';

export function DisplayOrWorkspaceNameForm() {
	const { workspace, isPersonal } = useWorkspace();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			name: workspace.name,
		},
		resetOptions: { keepDirtyValues: true },
	});

	const { updateWorkspace } = useUpdateWorkspace({
		onSuccess: () => form.reset(),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSchema>) => {
		await updateWorkspace(data);
	};

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title={isPersonal ? 'Your Name' : 'Workspace Name'}
			subtitle={
				isPersonal ?
					'Please enter your full name, or a display name you are comfortable with. This is how your name will appear to others on the platform.'
				:	`This is your workspace's visible name within Barely. For example, the name of your band, solo project, or company.`
			}
			disableSubmit={!form.formState.isDirty}
			formHint='Please use a maximum of 32 characters'
		>
			<TextField label='' control={form.control} name='name' />
		</SettingsCardForm>
	);
}

export function HandleForm() {
	// const { form, onSubmit, isPersonal } = useWorkspaceUpdateForm({
	// 	updateKeys: ['handle'],
	// });

	const { workspace, isPersonal } = useWorkspace();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			handle: workspace.handle,
		},
		resetOptions: { keepDirtyValues: true },
	});

	const { updateWorkspace } = useUpdateWorkspace({
		onSuccess: () => form.reset(),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSchema>) => {
		await updateWorkspace(data);
	};

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title={isPersonal ? 'Your Handle' : 'Workspace Handle'}
			subtitle={
				isPersonal ?
					'Please enter a personal handle that you are comfortable with. This is how your name will appear to others on the platform.'
				:	`This is your workspace's unique handle on Barely. It'll be used for your public links and bio.`
			}
			disableSubmit={!form.formState.isDirty}
			formHint='Only lowercase letters, numbers, and underscores are allowed.'
		>
			<TextField label='' control={form.control} name='handle' />

			{!isPersonal && (
				<div className='flex flex-col gap-1'>
					<div className='flex flex-row items-center gap-2 text-muted-foreground'>
						<Icon.bio className='h-3 w-3' />
						<Text variant='sm/normal' muted>
							{form.watch('handle')}.barely.bio
						</Text>
					</div>
					<div className='flex flex-row items-center gap-2 text-muted-foreground'>
						<Icon.newspaper className='h-3 w-3' />
						<Text variant='sm/normal' muted>
							{form.watch('handle')}.barely.press
						</Text>
					</div>
					<div className='flex flex-row items-center gap-2 text-muted-foreground'>
						<Icon.link className='h-3 w-3' />
						<Text variant='sm/normal' muted>
							{form.watch('handle')}.barely.link/transparent-link
						</Text>
					</div>
				</div>
			)}
		</SettingsCardForm>
	);
}

export function WorkspaceTypeForm() {
	const { workspace, isPersonal } = useWorkspace();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			type: workspace.type,
		},
		resetOptions: { keepDirtyValues: true },
	});

	const { updateWorkspace } = useUpdateWorkspace({
		onSuccess: () => form.reset(),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSchema>) => {
		await updateWorkspace(data);
	};

	if (isPersonal) {
		return null;
	}

	const workspaceTypeOptions: SelectFieldOption<z.infer<typeof workspaceTypeSchema>>[] = [
		{ value: 'creator', label: 'Creator' },
		{ value: 'solo_artist', label: 'Solo Artist' },
		{ value: 'band', label: 'Band' },
		{ value: 'product', label: 'Product' },
	];

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title='Workspace Type'
			subtitle='This is your workspace type on Barely.'
			disableSubmit={!form.formState.isDirty}
		>
			<SelectField
				label=''
				control={form.control}
				name='type'
				options={workspaceTypeOptions}
			/>
		</SettingsCardForm>
	);
}

const avatarUploadQueueAtom = atom<UploadQueueItem[]>([]);
export function WorkspaceAvatarForm() {
	const apiUtils = api.useUtils();

	const { workspace } = useWorkspace();
	const isPersonal = workspace.type === 'personal';

	const { mutateAsync: updateWorkspaceAvatar } = api.workspace.updateAvatar.useMutation();

	const onUploadComplete: OnUploadComplete = useCallback(
		async fileRecord => {
			if (!fileRecord.id) {
				return;
			}

			await updateWorkspaceAvatar({ avatarFileId: fileRecord.id });
			await apiUtils.workspace.invalidate();
		},
		[updateWorkspaceAvatar, apiUtils.workspace],
	);

	const avatarUploadState = useUpload({
		uploadQueueAtom: avatarUploadQueueAtom,
		folder: 'avatars',
		allowedFileTypes: ['image'],
		maxFiles: 1,
		onUploadComplete,
	});

	const { isPendingPresigns, uploadQueue, uploading, handleSubmit } = avatarUploadState;

	// const imagePreview =
	// 	avatarUploadState.uploadQueue[0]?.previewImage;

	return (
		<SettingsCard
			title={isPersonal ? 'Your Avatar' : 'Workspace Avatar'}
			subtitle={
				isPersonal ?
					'This is your personal avatar on Barely.'
				:	`This is your workspace's avatar on Barely.`
			}
			onSubmit={handleSubmit}
			disableSubmit={
				uploadQueue[0]?.status === 'complete' ||
				uploadQueue.length === 0 ||
				isPendingPresigns ||
				uploading
			}
			isSubmitting={uploading}
		>
			<UploadDropzone
				{...avatarUploadState}
				title=''
				subtitle=''
				imagePreviewSrc={avatarUploadState.uploadQueue[0]?.previewImage}
				existingImageS3Key={workspace.avatarImageS3Key}
				className='h-28 w-28 rounded-full'
			/>
		</SettingsCard>
	);
}

const headerUploadQueueAtom = atom<UploadQueueItem[]>([]);
export function WorkspaceHeaderForm() {
	const { workspace } = useWorkspace();
	const isPersonal = workspace.type === 'personal';
	const apiUtils = api.useUtils();

	const { mutateAsync: updateWorkspaceHeader } = api.workspace.updateHeader.useMutation();

	const onUploadComplete: OnUploadComplete = useCallback(
		async fileRecord => {
			await updateWorkspaceHeader({ headerFileId: fileRecord.id });
			await apiUtils.workspace.invalidate();
		},
		[updateWorkspaceHeader, apiUtils.workspace],
	);

	const headerUploadState = useUpload({
		uploadQueueAtom: headerUploadQueueAtom,
		folder: 'headers',
		allowedFileTypes: ['image'],
		maxFiles: 1,
		onUploadComplete,
	});

	const { isPendingPresigns, uploadQueue, uploading, handleSubmit } = headerUploadState;

	// const imagePreview =
	// 	headerUploadState.uploadQueue[0]?.previewImage ?? workspace.headerImageUrl;

	return (
		<SettingsCard
			title={isPersonal ? 'Your Header' : 'Workspace Header'}
			subtitle={
				isPersonal ?
					'This is your personal header on Barely.'
				:	`This is your workspace's header on Barely.`
			}
			onSubmit={handleSubmit}
			disableSubmit={
				uploadQueue[0]?.status === 'complete' ||
				uploadQueue.length === 0 ||
				isPendingPresigns ||
				uploading
			}
			isSubmitting={uploading}
		>
			<UploadDropzone
				{...headerUploadState}
				title=''
				subtitle=''
				imagePreviewSrc={headerUploadState.uploadQueue[0]?.previewImage}
				existingImageS3Key={workspace.headerImageS3Key}
				className='h-80 w-full rounded-md'
			/>
		</SettingsCard>
	);
}

export function WorkspaceBioForm() {
	const { workspace } = useWorkspace();
	// const { form, onSubmit, isPersonal } = useWorkspaceUpdateForm({
	// 	updateKeys: ['bio'],
	// });
	const ref = useRef<MDXEditorMethods>(null);
	const isPersonal = workspace.type === 'personal';

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			bio: workspace.bio,
		},
		resetOptions: { keepDirtyValues: true },
	});

	const { updateWorkspace } = useUpdateWorkspace({
		onSuccess: () => form.reset(),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSchema>) => {
		await updateWorkspace(data);
	};

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title={isPersonal ? 'Your Bio' : 'Workspace Bio'}
			subtitle={
				isPersonal ?
					'This is your personal bio on Barely.'
				:	`This is your workspace's bio on Barely.`
			}
			disableSubmit={!form.formState.isDirty}
		>
			<MDXEditor
				ref={ref}
				markdown={workspace.bio ?? ''}
				onChange={v => {
					form.setValue('bio', v, { shouldDirty: true });
				}}
			/>
		</SettingsCardForm>
	);
}

export function WorkspaceBrandHuesForm() {
	// const { form, onSubmit, isPersonal } = useWorkspaceUpdateForm({
	// 	updateKeys: ['brandHue'],
	// });

	const { workspace, isPersonal } = useWorkspace();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			brandHue: workspace.brandHue,
		},
		resetOptions: { keepDirtyValues: true },
	});

	const { updateWorkspace } = useUpdateWorkspace({
		onSuccess: () => form.reset(),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSchema>) => {
		await updateWorkspace(data);
	};

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title='Brand Hues'
			subtitle={
				isPersonal ?
					'This is your personal brand hues on Barely.'
				:	`This is your workspace's brand hues on Barely.`
			}
			disableSubmit={!form.formState.isDirty}
		>
			brandHue: {form.watch('brandHue')}
			<HuePicker
				step={10}
				value={form.watch('brandHue')}
				onChange={e => {
					form.setValue('brandHue', e.detail, { shouldDirty: true });
				}}
			/>
			{/* <pre>{JSON.stringify(form.formState.errors, null, 2)}</pre> */}
		</SettingsCardForm>
	);
}
