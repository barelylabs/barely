import { Suspense } from 'react';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { HydrateClient, trpcCaller } from '~/trpc/server';
import { FlowPage } from './flow-page';

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
					<FlowPage
						initialFlow={initialFlow}
						defaultEmailAddress={defaultEmailAddress}
						defaultMailchimpAudienceId={defaultMailchimpAudienceId}
						defaultEmailTemplateGroup={defaultEmailTemplateGroup}
					/>
				</Suspense>
			</HydrateClient>
		</DashContent>
	);
}
