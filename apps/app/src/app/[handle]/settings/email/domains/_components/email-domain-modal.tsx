import type { InsertEmailDomain } from '@barely/lib/server/routes/email-domain/email-domain.schema';
import type { z } from 'zod';
import { useEffect, useState } from 'react';
import { atomWithToggle } from '@barely/lib/atoms/atom-with-toggle';
// import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { createEmailDomainSchema } from '@barely/lib/server/routes/email-domain/email-domain.schema';
import { atom, useAtom } from 'jotai';

// import { useEmailDomains } from '@barely/hooks/use-email-domains';

import { Icon } from '@barely/ui/elements/icon';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { TextField } from '@barely/ui/forms/text-field';

export const showEmailDomainModalAtom = atomWithToggle(false);
export const updateEmailDomainAtom = atom<InsertEmailDomain | undefined>(undefined);

export function EmailDomainModal() {
	const apiUtils = api.useUtils();
	// const {workspace} = useWorkspace();

	// const { domains } = useEmailDomains();

	const [editEmailDomain, setEditEmailDomain] = useAtom(updateEmailDomainAtom);
	const [showEmailDomainModal, setShowEmailDomainModal] = useAtom(
		showEmailDomainModalAtom,
	);

	const form = useZodForm({
		schema: createEmailDomainSchema,
		values: editEmailDomain ?? {
			name: '',
		},
		resetOptions: {
			keepDirtyValues: true, // retain user-interacted input
		},
	});

	const { mutateAsync: createEmailDomain } = api.emailDomain.create.useMutation({
		onSuccess: async () => {
			await apiUtils.emailTemplate.invalidate();
			setShowEmailDomainModal(false);
			setEditEmailDomain(undefined);
			form.reset();
		},
	});

	const { mutateAsync: updateEmailDomain } = api.emailDomain.update.useMutation({
		onSuccess: async () => {
			await apiUtils.emailTemplate.invalidate();
			setShowEmailDomainModal(false);
			setEditEmailDomain(undefined);
			form.reset();
		},
	});

	const handleSubmit = async (data: z.infer<typeof createEmailDomainSchema>) => {
		if (editEmailDomain) {
			return await updateEmailDomain({
				...data,
				id: editEmailDomain.id,
			});
		}

		return await createEmailDomain(data);
	};

	const [domainInputLocked, setDomainInputLocked] = useState(false);

	useEffect(() => {
		if (editEmailDomain?.name) {
			setDomainInputLocked(true);
		}
	}, [editEmailDomain?.name]);

	const submitDisabled = editEmailDomain && !form.formState.isDirty;

	return (
		<Modal
			showModal={showEmailDomainModal}
			setShowModal={setShowEmailDomainModal}
			onClose={() => {
				form.reset();
			}}
			className='max-h-fit max-w-md'
		>
			<ModalHeader
				icon='domain'
				title={`${editEmailDomain ? 'Edit' : 'Add'} Email Domain`}
			/>
			<ModalBody>
				<Form form={form} onSubmit={handleSubmit}>
					<TextField
						control={form.control}
						name='name'
						label='Your domain'
						labelButton={
							editEmailDomain &&
							domainInputLocked && (
								<button
									className='flex flex-row items-center gap-1 text-right'
									type='button'
									onClick={() => {
										window.confirm(
											`Warning: Changing your email domain means you won't be able to send email from this domain anymore. Are you sure you want to continue?`,
										) && setDomainInputLocked(!domainInputLocked);
									}}
								>
									<Icon.lock className='h-3 w-3' />
									<p>Unlock</p>
								</button>
							)
						}
						disabled={editEmailDomain && domainInputLocked}
						placeholder='hello.example.com'
						infoTooltip='This is the domain that will be used to send emails from.'
					/>
					<SubmitButton disabled={submitDisabled} fullWidth>
						{editEmailDomain ? 'Save changes' : 'Add domain'}
					</SubmitButton>
				</Form>
			</ModalBody>
		</Modal>
	);
}
