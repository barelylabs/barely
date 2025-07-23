'use client';

import type { z } from 'zod/v4';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { insertMetaPixelSchema } from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { SettingsCardForm } from '@barely/ui/components/settings-card';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';

export function RemarketingSettings() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const { data: endpoints } = useSuspenseQuery(
		trpc.analyticsEndpoint.byCurrentWorkspace.queryOptions({ handle }),
	);

	const queryClient = useQueryClient();
	const { workspace } = useWorkspace();

	const metaPixelForm = useZodForm({
		schema: insertMetaPixelSchema,
		values: {
			platform: 'meta',
			workspaceId: workspace.id,
			id: endpoints.meta?.id ?? '',
			accessToken: endpoints.meta?.accessToken ?? '',
		},
	});

	const { mutateAsync: updateEndpoint } = useMutation({
		...trpc.analyticsEndpoint.update.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries(
				trpc.analyticsEndpoint.byCurrentWorkspace.pathFilter(),
			);
			metaPixelForm.reset();
		},
	});

	async function onSubmit(data: z.infer<typeof insertMetaPixelSchema>) {
		await updateEndpoint({
			...data,
			handle,
		}).catch(e => console.error(e));
	}

	return (
		<SettingsCardForm
			icon='meta'
			title='Meta Pixel'
			subtitle='Your Meta pixel information'
			form={metaPixelForm}
			onSubmit={onSubmit}
			disableSubmit={!metaPixelForm.formState.isDirty}
		>
			<TextField control={metaPixelForm.control} name='id' label='Pixel ID' />
			<TextAreaField
				name='accessToken'
				control={metaPixelForm.control}
				label='Pixel Access Token'
				className='break-words'
			/>
		</SettingsCardForm>
	);
}
