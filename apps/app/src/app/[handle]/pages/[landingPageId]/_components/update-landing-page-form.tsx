'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import type { z } from 'zod';
import { use, useCallback } from 'react';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { updateLandingPageSchema } from '@barely/lib/server/routes/landing-page/landing-page.schema';

import { MDXEditor } from '@barely/ui/elements/mdx-editor';
import { Form, SubmitButton } from '@barely/ui/forms';
import { TextField } from '@barely/ui/forms/text-field';

export function UpdateLandingPageForm({
	initialLandingPage,
}: {
	initialLandingPage: Promise<AppRouterOutputs['landingPage']['byId']>;
}) {
	const apiUtils = api.useUtils();
	const initialPage = use(initialLandingPage);

	/* mutations */
	const { mutateAsync: updateLandingPage } = api.landingPage.update.useMutation({
		onSuccess: async () => {
			await apiUtils.landingPage.invalidate();
		},
	});

	/* form */
	const form = useZodForm({
		schema: updateLandingPageSchema,
		defaultValues: initialPage,
	});

	const handleSubmit = useCallback(
		async (data: z.infer<typeof updateLandingPageSchema>) => {
			await updateLandingPage(data);
		},
		[updateLandingPage],
	);

	const submitDisabled = form.formState.isSubmitting || !form.formState.isDirty;

	return (
		<Form form={form} onSubmit={handleSubmit}>
			<div className='grid grid-cols-[250px_1fr] gap-4 '>
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
