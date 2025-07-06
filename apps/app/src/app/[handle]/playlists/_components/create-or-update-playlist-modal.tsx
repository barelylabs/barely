'use client';

import { useCallback } from 'react';
import { useCreateOrUpdateForm, useWorkspace } from '@barely/hooks';
import { useTRPC } from '@barely/api/app/trpc.react';
import { upsertPlaylistSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

import { usePlaylist, usePlaylistSearchParams } from '~/app/[handle]/playlists/_components/playlist-context';

export function CreateOrUpdatePlaylistModal({ mode }: { mode: 'create' | 'update' }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();

	/* playlist hooks */
	const { lastSelectedItem: selectedPlaylist } = usePlaylist();
	const {
		showCreateModal,
		showUpdateModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = usePlaylistSearchParams();

	/* mutations */
	const { mutateAsync: createPlaylist } = useMutation(
		trpc.playlist.create.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	const { mutateAsync: updatePlaylist } = useMutation(
		trpc.playlist.update.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	/* form */
	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedPlaylist ?? null),
		upsertSchema: upsertPlaylistSchema,
		defaultValues: {
			name: mode === 'update' ? (selectedPlaylist?.name ?? '') : '',
			description: mode === 'update' ? (selectedPlaylist?.description ?? '') : '',
			spotifyId: mode === 'update' ? (selectedPlaylist?.spotifyId ?? '') : '',
			public: mode === 'update' ? (selectedPlaylist?.public ?? true) : true,
			userOwned: mode === 'update' ? (selectedPlaylist?.userOwned ?? true) : true,
			forTesting: mode === 'update' ? (selectedPlaylist?.forTesting ?? false) : false,
		},
		handleCreateItem: async d => {
			await createPlaylist({
				...d,
				handle,
			});
		},
		handleUpdateItem: async d => {
			await updatePlaylist({
				...d,
				handle,
			});
		},
	});

	/* modal */
	const showModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		// Focus will be handled by the grid list component
		await queryClient.invalidateQueries(
			trpc.playlist.byWorkspace.queryFilter({ handle }),
		);
		form.reset();
		setShowModal(false);
	}, [form, queryClient, trpc.playlist, setShowModal, handle]);

	const submitDisabled = mode === 'update' && !form.formState.isDirty;

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			preventDefaultClose={form.formState.isDirty}
			onClose={handleCloseModal}
		>
			<ModalHeader
				icon='playlist'
				title={
					mode === 'update' ? `Update ${selectedPlaylist?.name ?? ''}` : 'Create Playlist'
				}
			/>

			<Form form={form} onSubmit={onSubmit}>
				<ModalBody>
					<TextField label='Name' control={form.control} name='name' />
					<TextAreaField label='Description' control={form.control} name='description' />
					<TextField label='Spotify ID' control={form.control} name='spotifyId' />
					<SwitchField
						label='Public'
						control={form.control}
						name='public'
						description='Is this playlist public?'
					/>
					<SwitchField
						label='User Owned'
						control={form.control}
						name='userOwned'
						description='Is this playlist owned by a user?'
					/>
					<SwitchField
						label='For Testing'
						control={form.control}
						name='forTesting'
						description='Is this playlist for testing purposes?'
					/>
				</ModalBody>
				<ModalFooter>
					<SubmitButton disabled={submitDisabled} fullWidth>
						{mode === 'update' ? 'Save Playlist' : 'Create Playlist'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
