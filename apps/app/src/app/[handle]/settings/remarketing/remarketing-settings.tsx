'use client';

import type { z } from 'zod/v4';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { insertMetaPixelSchema, insertTiktokPixelSchema } from '@barely/validators';
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

	/* Meta Pixel */
	const metaPixelForm = useZodForm({
		schema: insertMetaPixelSchema,
		values: {
			platform: 'meta',
			workspaceId: workspace.id,
			id: endpoints.meta?.id ?? '',
			accessToken: endpoints.meta?.accessToken ?? '',
		},
	});

	const { mutateAsync: updateEndpoint } = useMutation(
		trpc.analyticsEndpoint.update.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(
					trpc.analyticsEndpoint.byCurrentWorkspace.pathFilter(),
				);
				metaPixelForm.reset();
				tiktokPixelForm.reset();
			},
		}),
	);

	async function onSubmitMeta(data: z.infer<typeof insertMetaPixelSchema>) {
		await updateEndpoint({
			...data,
			handle,
		}).catch(e => console.error(e));
	}

	/* TikTok Pixel */
	const tiktokPixelForm = useZodForm({
		schema: insertTiktokPixelSchema,
		values: {
			platform: 'tiktok',
			workspaceId: workspace.id,
			id: endpoints.tiktok?.id ?? '',
			accessToken: endpoints.tiktok?.accessToken ?? '',
		},
	});

	async function onSubmitTiktok(data: z.infer<typeof insertTiktokPixelSchema>) {
		await updateEndpoint({
			...data,
			handle,
		}).catch(e => console.error(e));
	}

	return (
		<>
			<SettingsCardForm
				icon='meta'
				title='Meta Pixel'
				subtitle='Your Meta pixel information'
				form={metaPixelForm}
				onSubmit={onSubmitMeta}
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

			<SettingsCardForm
				icon='tiktok'
				title='TikTok Pixel'
				subtitle='Your TikTok pixel information'
				form={tiktokPixelForm}
				onSubmit={onSubmitTiktok}
				disableSubmit={!tiktokPixelForm.formState.isDirty}
			>
				<TextField control={tiktokPixelForm.control} name='id' label='Pixel Code' />
				<TextAreaField
					name='accessToken'
					control={tiktokPixelForm.control}
					label='Access Token'
					className='break-words'
				/>
			</SettingsCardForm>
		</>
	);
}
