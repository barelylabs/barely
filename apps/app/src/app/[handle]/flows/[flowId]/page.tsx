import { Suspense } from 'react';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { FlowBuilder } from '~/app/[handle]/flows/[flowId]/_components/flow-builder';
import { FlowStoreProvider } from '~/app/[handle]/flows/[flowId]/_components/flow-store';
import { FlowUpdateForm } from '~/app/[handle]/flows/[flowId]/_components/flow-update-form';
import { HydrateClient, trpcCaller } from '~/trpc/server';

export default async function FlowsPage({
	params,
}: {
	params: Promise<{ handle: string; flowId: string }>;
}) {
	const awaitedParams = await params;

	const initialFlow = trpcCaller.flow.byId({
		handle: awaitedParams.handle,
		flowId: awaitedParams.flowId,
	});
	const defaultEmailAddress = trpcCaller.emailAddress.default({
		handle: awaitedParams.handle,
	});
	const defaultMailchimpAudienceId = trpcCaller.mailchimp.defaultAudience({
		handle: awaitedParams.handle,
	});
	const defaultEmailTemplateGroup = trpcCaller.emailTemplateGroup.default({
		handle: awaitedParams.handle,
	});

	return (
		<DashContent>
			<HydrateClient>
				<Suspense fallback={<div>Loading...</div>}>
					<FlowStoreProvider
						initialFlow={initialFlow}
						defaultEmailAddress={defaultEmailAddress}
						initialDefaultMailchimpAudienceId={defaultMailchimpAudienceId}
						initialDefaultEmailTemplateGroup={defaultEmailTemplateGroup}
					>
						<div className='flex flex-col gap-8 xl:flex-row'>
							<FlowUpdateForm initialFlow={initialFlow} />
							<div className='flex w-full items-center justify-center rounded-xl border border-border bg-border/25 p-10'>
								<FlowBuilder />
							</div>
						</div>
					</FlowStoreProvider>
				</Suspense>
			</HydrateClient>
		</DashContent>
	);
}
