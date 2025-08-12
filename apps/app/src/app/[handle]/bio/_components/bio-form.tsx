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
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';

import { ThemeSelector } from './theme-selector';

interface BioFormProps {
	bio: BioWithButtons;
	handle: string;
}

export function BioForm({ bio, handle }: BioFormProps) {
	const queryClient = useQueryClient();
	const trpc = useTRPC();

	const formSchema = updateBioSchema.extend({ handle: z.string() });

	const form = useZodForm({
		schema: formSchema,
		defaultValues: {
			id: bio.id,
			handle,
			title: bio.title ?? '',
			subtitle: bio.subtitle ?? '',
			theme: bio.theme ?? 'light',
			barelyBranding: bio.barelyBranding ?? true,
		},
	});

	const updateMutation = useMutation({
		...trpc.bio.update.mutationOptions(),
		onSuccess: () => {
			toast.success('Bio updated successfully');
			void queryClient.invalidateQueries({
				queryKey: trpc.bio.byHandle.queryKey({ handle }),
			});
		},
		onError: error => {
			toast.error(error.message ?? 'Failed to update bio');
		},
	});

	const handleSubmit = (data: z.infer<typeof formSchema>) => {
		updateMutation.mutate(data);
	};

	return (
		<Form form={form} onSubmit={handleSubmit}>
			<div className='space-y-6'>
				<div className='space-y-4'>
					<h3 className='text-lg font-semibold'>Profile</h3>

					<TextField
						control={form.control}
						name='title'
						label='Title'
						placeholder='Your name or brand'
						description='The main heading on your bio page'
					/>

					<TextAreaField
						control={form.control}
						name='subtitle'
						label='Subtitle'
						placeholder='A brief description about you'
						description='Optional tagline or description'
						rows={2}
					/>
				</div>

				<div className='space-y-4'>
					<h3 className='text-lg font-semibold'>Appearance</h3>

					<ThemeSelector
						value={(form.watch('theme') as any) ?? 'default'}
						onChange={theme => form.setValue('theme', theme as any)}
					/>
				</div>

				<div className='space-y-4'>
					<h3 className='text-lg font-semibold'>Settings</h3>

					<SwitchField
						control={form.control}
						name='barelyBranding'
						label='Show "Powered by barely.ai"'
						description='Support us by showing a small link at the bottom'
					/>
				</div>

				<SubmitButton loading={updateMutation.isPending}>Save Changes</SubmitButton>
			</div>
		</Form>
	);
}
