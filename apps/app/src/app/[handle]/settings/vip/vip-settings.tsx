'use client';

import type { z } from 'zod/v4';
import { useUpdateWorkspace, useWorkspaceWithAll, useZodForm } from '@barely/hooks';
import { updateWorkspaceSchema } from '@barely/validators';

import { SettingsCardForm } from '@barely/ui/components/settings-card';
import { TextField } from '@barely/ui/forms/text-field';

export function VipSupportEmail() {
	const workspace = useWorkspaceWithAll();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			vipSupportEmail: workspace.vipSupportEmail,
		},
	});

	const { updateWorkspace } = useUpdateWorkspace({
		onSuccess: () => form.reset(),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSchema>) => {
		await updateWorkspace({
			...data,
			handle: workspace.handle,
		});
	};

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title='Support Email'
			subtitle='Please enter your support email.'
			disableSubmit={!form.formState.isDirty}
		>
			<TextField label='Email' control={form.control} name='vipSupportEmail' />
		</SettingsCardForm>
	);
}
