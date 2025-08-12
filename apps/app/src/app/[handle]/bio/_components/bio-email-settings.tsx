'use client';

import type { BioWithButtons } from '@barely/validators';
import { useZodForm } from '@barely/hooks';
import { updateBioSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';

interface BioEmailSettingsProps {
	bio: BioWithButtons;
	handle: string;
}

export function BioEmailSettings({ bio, handle }: BioEmailSettingsProps) {
	const queryClient = useQueryClient();
	const trpc = useTRPC();

	const formSchema = updateBioSchema
		.pick({
			id: true,
			handle: true,
			emailCaptureEnabled: true,
			emailCaptureIncentiveText: true,
		})
		.extend({ handle: z.string() });

	const form = useZodForm({
		schema: formSchema,
		defaultValues: {
			id: bio.id,
			handle,
			emailCaptureEnabled: bio.emailCaptureEnabled ?? false,
			emailCaptureIncentiveText: bio.emailCaptureIncentiveText ?? '',
		},
	});

	const updateMutation = useMutation({
		...trpc.bio.update.mutationOptions(),
		onSuccess: () => {
			toast.success('Email settings updated');
			void queryClient.invalidateQueries({
				queryKey: trpc.bio.byHandle.queryKey({ handle }),
			});
		},
		onError: error => {
			toast.error(error.message ?? 'Failed to update email settings');
		},
	});

	const handleSubmit = (data: z.infer<typeof formSchema>) => {
		updateMutation.mutate(data);
	};

	const emailCaptureEnabled = form.watch('emailCaptureEnabled');

	return (
		<Form form={form} onSubmit={handleSubmit}>
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold'>Email Capture</h3>

				<SwitchField
					control={form.control}
					name='emailCaptureEnabled'
					label='Enable email capture'
					description='Show an email signup form on your bio page'
				/>

				{emailCaptureEnabled && (
					<TextField
						control={form.control}
						name='emailCaptureIncentiveText'
						label='Incentive Text'
						placeholder='Join my newsletter for exclusive content'
						description='Encourage visitors to sign up'
					/>
				)}

				<SubmitButton loading={updateMutation.isPending}>
					Save Email Settings
				</SubmitButton>
			</div>
		</Form>
	);
}
