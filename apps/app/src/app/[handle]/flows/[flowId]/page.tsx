import { api } from '@barely/lib/server/api/server';

import { FlowBuilder } from '~/app/[handle]/flows/[flowId]/_components/flow-builder';
import { FlowStoreProvider } from '~/app/[handle]/flows/[flowId]/_components/flow-store';
import { FlowUpdateForm } from '~/app/[handle]/flows/[flowId]/_components/flow-update-form';

export default function FlowsPage({
	params,
}: {
	params: { handle: string; flowId: string };
}) {
	const { handle, flowId } = params;
	const initialFlow = api({ handle }).flow.byId({ flowId });
	const defaultEmailAddress = api({ handle }).emailAddress.default();
	const defaultMailchimpAudienceId = api({ handle }).mailchimp.defaultAudience({
		handle,
	});

	return (
		<FlowStoreProvider
			initialFlow={initialFlow}
			defaultEmailAddress={defaultEmailAddress}
			initialDefaultMailchimpAudienceId={defaultMailchimpAudienceId}
		>
			<div className='flex flex-col gap-8 xl:flex-row'>
				<FlowUpdateForm initialFlow={initialFlow} />
				<div className='flex w-full items-center justify-center rounded-xl border border-border bg-border/25 p-10'>
					<FlowBuilder />
				</div>
			</div>
		</FlowStoreProvider>
	);
}
