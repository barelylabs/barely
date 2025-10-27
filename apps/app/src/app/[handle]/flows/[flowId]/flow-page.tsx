'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { NavigationGuardProvider } from 'next-navigation-guard';

import { FlowBuilder } from './_components/flow-builder';
import { FlowStoreProvider } from './_components/flow-store';
import { FlowUpdateForm } from './_components/flow-update-form';

export function FlowPage({
	initialFlow,
	defaultEmailAddress,
	defaultMailchimpAudienceId,
	defaultEmailTemplateGroup,
}: {
	initialFlow: Promise<AppRouterOutputs['flow']['byId']>;
	defaultEmailAddress: Promise<AppRouterOutputs['emailAddress']['default']>;
	defaultMailchimpAudienceId: Promise<AppRouterOutputs['mailchimp']['defaultAudience']>;
	defaultEmailTemplateGroup: Promise<AppRouterOutputs['emailTemplateGroup']['default']>;
}) {
	return (
		<NavigationGuardProvider>
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
		</NavigationGuardProvider>
	);
}
