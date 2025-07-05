'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
	useCreateOrUpdateForm,
	useDebounce,
	useWebDomains,
	useWorkspace,
} from '@barely/hooks';
import { useTRPC } from '@barely/api/app/trpc.react';
import {
	getTransparentLinkDataFromUrl,
	getUrlWithoutTrackingParams,
	isValidUrl,
	sanitizeKey,
} from '@barely/utils';
import { defaultLink, upsertLinkSchema } from '@barely/validators';
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query';

import { BlurImage } from '@barely/ui/blur-image';
import { Button } from '@barely/ui/button';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Label } from '@barely/ui/label';
import { LoadingSpinner } from '@barely/ui/loading';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { InfoTooltip, TooltipContent } from '@barely/ui/tooltip';
import { Text } from '@barely/ui/typography';

import { useLinkContext } from '~/app/[handle]/links/_components/link-context';
import { LinkOptionalSettings } from '~/app/[handle]/links/_components/link-optional-settings';
import { SocialLinkPreviews } from '~/app/[handle]/links/_components/social-link-previews';

export function CreateOrUpdateLinkModal(props: { mode: 'create' | 'update' }) {
	const { mode } = props;
	const { handle } = useWorkspace();

	/* link context */
	const {
		lastSelectedItem: selectedLink,
		showCreateModal,
		setShowCreateModal,
		showUpdateModal,
		setShowUpdateModal,
		focusGridList,
	} = useLinkContext();

	/* modal state */
	const showLinkModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowLinkModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	/* api */
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { linkDomains, primaryLinkDomain } = useWebDomains();

	const domainOptions = linkDomains.map(domain => ({
		value: domain.domain,
		label: domain.domain,
	}));

	const { workspace } = useWorkspace();

	const { mutateAsync: createLink } = useMutation(
		trpc.link.create.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	const { mutateAsync: updateLink } = useMutation(
		trpc.link.update.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	/* form */
	const { form, onSubmit: handleSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedLink ?? null),
		upsertSchema: upsertLinkSchema,
		handleCreateItem: async d => {
			await createLink({
				...d,
				handle,
			});
		},
		handleUpdateItem: async d => {
			await updateLink({
				...d,
				handle,
			});
		},
		defaultValues: {
			...defaultLink,
			domain: primaryLinkDomain.domain,
		},
	});

	/**
	 *  Link state derived from url (app/appRoute, metaTags)
	 *  This data is stored outside the form, but used in onSubmit
	 * */
	const url = form.watch('url');
	const [debouncedUrl, setDebouncedUrl, urlIsDebounced] = useDebounce(url);

	/**
	 * if editLink.url changes (i.e. we've selected it outside of the modal or it's been updated on the backend and propagated to the client),
	 * we want to immediately update the debouncedUrl
	 * */
	useEffect(() => {
		if (mode === 'update' && selectedLink?.url) {
			setDebouncedUrl(selectedLink.url);
		} else {
			setDebouncedUrl(url);
		}
	}, [mode, url, selectedLink?.url, setDebouncedUrl]);

	// transparent link
	const transparentLinkData = useMemo(() => {
		if (!debouncedUrl) return null;

		return getTransparentLinkDataFromUrl(debouncedUrl, workspace);
	}, [workspace, debouncedUrl]);

	// meta tags
	const { data: metaTagsFromUrl, isFetching: isFetchingMetaTags } = useQuery({
		...trpc.link.getMetaTags.queryOptions(debouncedUrl),
		enabled: isValidUrl(debouncedUrl),
		refetchOnWindowFocus: false,
	});

	// we are generating meta tags if:
	// - mode === 'create' && isFetchingMetaTags
	// - there is an selectedLink && url is dirty && isFetchingMetaTags
	const generatingMetaTags =
		((mode === 'create' && isFetchingMetaTags) ||
			(mode === 'create' && !urlIsDebounced) ||
			(mode === 'update' && form.formState.dirtyFields.url && isFetchingMetaTags)) ??
		false;

	const metaTags = useMemo(() => {
		return (
				(form.watch('customMetaTags') ??
					(mode === 'update' && !form.formState.dirtyFields.url))
			) ?
				{
					image: '',
					title: form.watch('title') ?? '',
					description: form.watch('description') ?? '',
					favicon: form.watch('favicon') ?? '',
				}
			:	metaTagsFromUrl;
	}, [mode, form, metaTagsFromUrl]);

	/**
	 * Generate random key
	 * */
	const [generatingKey, setGeneratingKey] = useState(false);
	const { mutateAsync: generateRandomKey } = useMutation(
		trpc.link.generateRandomKey.mutationOptions(),
	);

	const randomizeKey = useCallback(async () => {
		setGeneratingKey(true);
		const key = await generateRandomKey({
			domain: form.watch('domain'),
		});

		form.setValue('key', key, {
			shouldDirty: true,
			shouldValidate: true,
		});
		setGeneratingKey(false);
	}, [generateRandomKey, form]);

	/** Close the modal */
	const handleCloseModal = useCallback(async () => {
		form.reset();
		focusGridList();
		setShowLinkModal(false);
		await queryClient.invalidateQueries(trpc.link.byWorkspace.queryFilter());
	}, [focusGridList, form, queryClient, trpc.link.byWorkspace, setShowLinkModal]);

	const LinkIconOrFavicon = useMemo(() => {
		if (!metaTags?.favicon) return null;
		return (
			<BlurImage
				src={metaTags.favicon}
				alt='Logo'
				className='mx-auto h-10 w-10'
				width={20}
				height={20}
			/>
		);
	}, [metaTags?.favicon]);

	return (
		<Modal
			showModal={showLinkModal}
			setShowModal={setShowLinkModal}
			preventDefaultClose={form.formState.isDirty}
			onClose={handleCloseModal}
		>
			<div className='grid w-full grid-cols-2'>
				<div className='flex flex-col border-r-2 border-border'>
					<ModalHeader
						icon='link'
						iconOverride={LinkIconOrFavicon}
						title={
							mode === 'update' && selectedLink ?
								`Update ${selectedLink.domain}/${selectedLink.key}`
							:	'Create a new link'
						}
					/>

					<Form form={form} className='space-y-0' onSubmit={handleSubmit}>
						<ModalBody>
							<div className='flex w-full max-w-full flex-col gap-8'>
								<div className='flex flex-col space-y-2'>
									<TextField
										name='url'
										control={form.control}
										label='Destination URL'
										onPaste={e => {
											const input = e.clipboardData.getData('text');
											if (!input || !isValidUrl(input)) return;
											e.preventDefault();
											const cleanUrl = getUrlWithoutTrackingParams(input);
											form.setValue('url', cleanUrl);
										}}
										disabled={mode === 'update' && !!selectedLink?.transparent}
									/>

									<AddWorkspaceSpotifyArtistId
										spotifyArtistId={
											(
												transparentLinkData?.app === 'spotify' &&
												transparentLinkData.appRoute?.startsWith('artist/')
											) ?
												transparentLinkData.appRoute.split('/')[1]
											:	''
										}
									/>

									<div className='flex flex-col space-y-1'>
										<div className='flex flex-row justify-between'>
											<Label className='items-center'>
												<div className='flex flex-row items-center gap-2'>
													<p>Short Link</p>
													{!linkDomains.length && (
														<InfoTooltip
															content={
																<TooltipContent
																	title='Instead of brl.to, you can use your own branded domain for your short links.'
																	cta='Add a domain'
																	href={`/${workspace.handle}/settings/domains`}
																/>
															}
														/>
													)}
												</div>
											</Label>
											{!selectedLink && (
												<Label asChild>
													<button
														className='flex flex-row items-center gap-1 text-right'
														onClick={() => randomizeKey()}
														disabled={generatingKey}
													>
														{generatingKey ?
															<LoadingSpinner />
														:	<Icon.shuffle className='h-3 w-3' />}
														<p>{generatingKey ? 'Generating' : 'Randomize'}</p>
													</button>
												</Label>
											)}
										</div>

										<div className='flex w-full flex-grow flex-row'>
											<Suspense fallback={<LoadingSpinner />}>
												<SelectField
													name='domain'
													options={domainOptions}
													className='w-fit flex-grow-0 rounded-r-none border-r-0'
													disabled={mode === 'update' && !!selectedLink?.key}
												/>
												<TextField
													name='key'
													className='flex-1 rounded-l-none'
													disabled={mode === 'update' && !!selectedLink?.key}
													onChange={e => {
														form.setValue('key', sanitizeKey(e.target.value), {
															shouldDirty: true,
														});
													}}
												/>
											</Suspense>
										</div>
									</div>
									{mode === 'update' && selectedLink?.transparent && (
										<div className='flex flex-col gap-1'>
											<Label>Transparent Link</Label>
											<TransparentLinkDisplay
												transparentLink={transparentLinkData?.transparentLink}
											/>
										</div>
									)}
								</div>

								<LinkOptionalSettings
									linkForm={form}
									selectedLink={selectedLink}
									transparentLinkData={transparentLinkData}
								/>
							</div>
						</ModalBody>
						<ModalFooter>
							<SubmitButton fullWidth>
								{mode === 'update' ? 'Save changes' : 'Create link'}
							</SubmitButton>
						</ModalFooter>
					</Form>
				</div>

				<SocialLinkPreviews
					url={debouncedUrl}
					metaTags={metaTags}
					generatingMetaTags={generatingMetaTags}
					closeModal={handleCloseModal}
				/>
			</div>
		</Modal>
	);
}

export function TransparentLinkDisplay({
	transparentLink,
}: {
	transparentLink?: string;
}) {
	if (!transparentLink) return null;

	return (
		<div className='flex w-full max-w-full flex-col gap-1'>
			<div className='flex h-fit min-h-[40px] w-full flex-row items-center gap-2 rounded-md border bg-slate-100 p-2'>
				<Icon.ghost className='h-4 w-4 text-muted-foreground' />
				<Text className='w-full break-all' variant='sm/normal'>
					{transparentLink}
				</Text>
			</div>
		</div>
	);
}

export function AddWorkspaceSpotifyArtistId(props: { spotifyArtistId?: string }) {
	const [show, setShow] = useState(true);
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { workspace } = useWorkspace();
	const { mutateAsync: updateWorkspace } = useMutation(
		trpc.workspace.update.mutationOptions(),
	);

	const { data: spotifyArtistIdTaken } = useSuspenseQuery({
		...trpc.workspace.spotifyArtistIdTaken.queryOptions(props.spotifyArtistId ?? ''),
		// enabled: !!props.spotifyArtistId,
	});

	const handleSubmit = async () => {
		await updateWorkspace({
			handle: workspace.handle,
			spotifyArtistId: props.spotifyArtistId,
		});
		await queryClient.invalidateQueries(trpc.workspace.byHandle.queryFilter());
	};

	if (
		!show ||
		spotifyArtistIdTaken === true ||
		!props.spotifyArtistId ||
		(workspace.spotifyArtistId?.length ?? 0) > 0
	)
		return null;

	return (
		<div className='flex flex-row items-center justify-between gap-2 py-2'>
			<Text variant='sm/normal'>
				👆 Is that the link to <span className='font-bold'>{workspace.name}</span>&apos;s
				Spotify Artist Profile?
			</Text>
			<div className='flex flex-row gap-2'>
				<Button look='primary' size='sm' onClick={handleSubmit}>
					yes
				</Button>
				<Button look='secondary' size='sm' onClick={() => setShow(false)}>
					no
				</Button>
			</div>
		</div>
	);
}
