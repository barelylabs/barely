'use client';

import type { z } from 'zod/v4';
import { api } from '@barely/lib/server/api/react';
import { insertMetaPixelSchema } from '@barely/lib/server/routes/analytics-endpoint/analytics-endpoint-schema';

import { useWorkspace } from '@barely/hooks/use-workspace';
import { useZodForm } from '@barely/hooks/use-zod-form';

import { SettingsCardForm } from '@barely/ui/components/settings-card';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';

export function RemarketingSettings() {
	const [endpoints] = api.analyticsEndpoint.byCurrentWorkspace.useSuspenseQuery();

	const apiUtils = api.useUtils();
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

	const { mutateAsync: updateEndpoint } = api.analyticsEndpoint.update.useMutation({
		onSuccess: async () => {
			await apiUtils.analyticsEndpoint.invalidate();
			metaPixelForm.reset();
		},
	});

	async function onSubmit(data: z.infer<typeof insertMetaPixelSchema>) {
		await updateEndpoint(data).catch(e => console.error(e));
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
