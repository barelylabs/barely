'use client';

import type { InsertDomain } from '@barely/validators';
import type { z } from 'zod/v4';
import { useEffect, useState } from 'react';
import { useWebDomains, useWorkspace, useZodForm } from '@barely/hooks';
import { insertDomainSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { atom, useAtom } from 'jotai';

import { useTRPC } from '@barely/api/app/trpc.react';

import { atomWithToggle } from '@barely/atoms/atom-with-toggle';

import { Button } from '@barely/ui/button';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';
import { SimpleTooltipContent } from '@barely/ui/tooltip';

export const showDomainModalAtom = atomWithToggle(false);
export const editDomainAtom = atom<InsertDomain | undefined>(undefined);

export function DomainModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { workspace } = useWorkspace();
	const { domains } = useWebDomains();

	const [editDomain, setEditDomain] = useAtom(editDomainAtom);
	const [showDomainModal, setShowDomainModal] = useAtom(showDomainModalAtom);

	/**
	 if editDomain exists, we're editing an existing domain
	 * todo: there should be a "Delete Domain" button that opens a confirmation modal
	*/

	const domainForm = useZodForm({
		schema: insertDomainSchema,
		values: editDomain ?? {
			workspaceId: workspace.id,
			domain: '',
			type: 'link',
			isPrimaryLinkDomain: false,
		},
		resetOptions: {
			keepDirtyValues: true, // retain user-interacted input
		},
	});

	const { mutateAsync: addDomain } = useMutation({
		...trpc.webDomain.add.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries(trpc.webDomain.byWorkspace.queryFilter());
			setShowDomainModal(false);
			setEditDomain(undefined);
			domainForm.reset();
		},
	});

	const { mutateAsync: updateDomain } = useMutation({
		...trpc.webDomain.update.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries(trpc.webDomain.byWorkspace.queryFilter());
			setShowDomainModal(false);
			setEditDomain(undefined);
			domainForm.reset();
		},
	});
	const { mutateAsync: deleteDomain } = useMutation({
		...trpc.webDomain.delete.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries(trpc.webDomain.byWorkspace.queryFilter());
			setShowDomainModal(false);
			setEditDomain(undefined);
			domainForm.reset();
		},
	});

	const onSubmit = async (data: z.infer<typeof insertDomainSchema>) => {
		if (editDomain)
			return await updateDomain({
				...data,
				handle: workspace.handle,
			});
		return await addDomain({
			...data,
			handle: workspace.handle,
		});
	};

	/** Form logic/effects */
	const linkType = domainForm.watch('type');
	const hasLinkDomains = domains.some(domain => domain.type === 'link');

	// if we're editing a link domain, set isPrimaryBioDomain and isPrimaryPressDomain to false
	useEffect(() => {
		if (linkType === 'link') {
			domainForm.setValue('isPrimaryBioDomain', false);
			domainForm.setValue('isPrimaryPressDomain', false);
		}
	}, [linkType, domainForm]);

	// if we're adding or editing a link domain, and there are no other link domains, set isPrimaryLinkDomain to true
	useEffect(() => {
		if (linkType === 'link' && !hasLinkDomains) {
			domainForm.setValue('isPrimaryLinkDomain', true);
		}
	}, [linkType, hasLinkDomains, domainForm]);

	useEffect(() => {
		if (editDomain?.domain) {
			setDomainInputLocked(true);
		}
	}, [editDomain?.domain]);

	const isPrimaryLinkDisabledState =
		linkType !== 'link' ?
			{ disabled: true, disabledTooltip: `This is a ${linkType} link.` } // the switch shouldn't actually be visible if we're not adding/editing a link domain
		: !hasLinkDomains ?
			{
				disabled: true,
				disabledTooltip: `This is your first link domain, so it's gotta be set to primary.`,
			}
		: editDomain?.isPrimaryLinkDomain ?
			{
				disabled: true,
				disabledTooltip: 'Please set another domain to be the primary link domain.',
			}
		:	{ disabled: false, disabledTooltip: '' };

	// disable the submit button if we're editing an existing domain, but nothing has changed
	const submitDisabled = editDomain && !domainForm.formState.isDirty;
	const deleteDisabled = editDomain?.isPrimaryLinkDomain;

	const [domainInputLocked, setDomainInputLocked] = useState(false);

	return (
		<Modal
			showModal={showDomainModal}
			setShowModal={setShowDomainModal}
			onClose={() => {
				setEditDomain(undefined);
				domainForm.reset();
			}}
			className='max-h-fit max-w-md'
		>
			<ModalHeader icon='domain' title={`${editDomain ? 'Edit' : 'Add'} domain`} />

			<ModalBody>
				<Form form={domainForm} onSubmit={onSubmit}>
					<TextField
						control={domainForm.control}
						name='domain'
						label='Your domain'
						labelButton={
							editDomain &&
							domainInputLocked && (
								<button
									className='flex flex-row items-center gap-1 text-right'
									type='button'
									onClick={() => {
										if (
											window.confirm(
												`Warning: Changing your link domain will break all short links that use it. Are you sure you want to continue?`,
											)
										) {
											setDomainInputLocked(!domainInputLocked);
										}
									}}
								>
									<Icon.lock className='h-3 w-3' />
									<p>Unlock</p>
								</button>
							)
						}
						disabled={editDomain && domainInputLocked}
						placeholder='properyouth.link'
						infoTooltip={
							<SimpleTooltipContent
								title='This is the domain that your short links will be hosted on. E.g. yourbrand.com/link'
								cta='Learn more'
								href='https://help.barely.io/en/articles/5236716-what-is-a-shortlink-domain'
							/>
						}
					/>

					{linkType === 'link' && (
						<SwitchField
							control={domainForm.control}
							name='isPrimaryLinkDomain'
							label='Primary link domain'
							disabled={isPrimaryLinkDisabledState.disabled}
							infoTooltip={
								'This will be the default domain for any new links you create.'
							}
							disabledTooltip={isPrimaryLinkDisabledState.disabledTooltip}
						/>
					)}
					<SubmitButton disabled={submitDisabled} fullWidth>
						{editDomain ? 'Save changes' : 'Add domain'}
					</SubmitButton>
					{editDomain && (
						<>
							<Button
								fullWidth
								look={deleteDisabled ? 'secondary' : 'destructive'}
								disabled={deleteDisabled}
								disabledTooltip={`You can't delete your primary ${linkType} domain`}
								onClick={async () => {
									if (
										window.confirm(
											`Warning: Deleting your ${linkType} domain will break all short links that use it. Are you sure you want to continue?`,
										)
									) {
										await deleteDomain({
											handle: workspace.handle,
											domain: editDomain.domain,
										});
									}
								}}
							>
								Delete domain
							</Button>
						</>
					)}
				</Form>
			</ModalBody>
		</Modal>
	);
}
