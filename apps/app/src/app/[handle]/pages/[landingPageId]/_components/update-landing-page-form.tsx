'use client';

import type { z } from 'zod/v4';
import { useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useZodForm } from '@barely/hooks';
import { useTRPC } from '@barely/api/app/trpc.react';
import { updateLandingPageSchema } from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { MDXEditor } from '@barely/ui/mdx-editor';

export function UpdateLandingPageForm() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const params = useParams<{ handle: string; landingPageId: string }>();

	const { data: initialPage } = useSuspenseQuery(
		trpc.landingPage.byId.queryOptions({
			handle: params.handle,
			landingPageId: params.landingPageId,
		}),
	);

	/* mutations */
	const { mutateAsync: updateLandingPage } = useMutation(
		trpc.landingPage.update.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(
					trpc.landingPage.byWorkspace.queryFilter({ handle: params.handle }),
				);
			},
		}),
	);

	/* form */
	const form = useZodForm({
		schema: updateLandingPageSchema,
		defaultValues: initialPage,
	});

	const handleSubmit = useCallback(
		async (data: z.infer<typeof updateLandingPageSchema>) => {
			await updateLandingPage({
				...data,
				handle: params.handle,
			});
		},
		[updateLandingPage, params.handle],
	);

	const submitDisabled = form.formState.isSubmitting || !form.formState.isDirty;

	return (
		<Form form={form} onSubmit={handleSubmit}>
			<div className='grid grid-cols-[250px_1fr] gap-4'>
				<div className='sticky top-0 flex h-fit flex-col gap-2'>
					<TextField
						name='name'
						label='Name'
						placeholder='Enter a name for the landing page'
						control={form.control}
						data-1p-ignore
						data-bwignore
						data-lpignore='true'
					/>
					<TextField
						name='key'
						label='Key'
						placeholder='Enter a key for the landing page'
						control={form.control}
						data-1p-ignore
						data-bwignore
						data-lpignore='true'
					/>
					<TextField
						name='metaTitle'
						label='Meta Title'
						placeholder='Enter a meta title for the landing page'
						control={form.control}
						data-1p-ignore
						data-bwignore
						data-lpignore='true'
					/>
					<SubmitButton fullWidth disabled={submitDisabled}>
						Update
					</SubmitButton>
				</div>

				<div className='flex flex-col gap-2'>
					<MDXEditor
						markdown={initialPage.content ?? ''}
						onChange={content => {
							form.setValue('content', content, { shouldDirty: true });
						}}
					/>
				</div>
			</div>
		</Form>
	);
}
