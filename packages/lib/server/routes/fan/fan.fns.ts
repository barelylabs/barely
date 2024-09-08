import { tasks } from '@trigger.dev/sdk/v3';
import { and, eq } from 'drizzle-orm';

import type { handleFlow } from '../../../trigger/flow.trigger';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { dbHttp } from '../../db';
import { Flow_Triggers } from '../flow/flow.sql';
import { Fans } from './fan.sql';

export async function createFan(props: {
	workspaceId: string;
	fullName: string;
	email: string;
	shippingAddressLine1?: string | null;
	shippingAddressLine2?: string | null;
	shippingAddressCity?: string | null;
	shippingAddressState?: string | null;
	shippingAddressPostalCode?: string | null;
	shippingAddressCountry?: string | null;

	billingAddressPostalCode?: string | null;
	billingAddressCountry?: string | null;

	stripeCustomerId?: string | null;
	stripePaymentMethodId?: string | null;

	emailMarketingOptIn?: boolean;
	smsMarketingOptIn?: boolean;
}) {
	const newFans = await dbHttp
		.insert(Fans)
		.values({
			id: newId('fan'),
			...props,
		})
		.returning();

	const newFan = newFans[0] ?? raise('error creating new fan');

	const newFanFlowTriggers = await dbHttp
		.select()
		.from(Flow_Triggers)
		.where(
			and(
				eq(Flow_Triggers.type, 'newFan'),
				eq(Flow_Triggers.workspaceId, props.workspaceId),
			),
		)
		.execute();

	if (newFanFlowTriggers.length) {
		for (const newFanFlowTrigger of newFanFlowTriggers) {
			await tasks.trigger<typeof handleFlow>('handle-flow', {
				triggerId: newFanFlowTrigger.id,
				fanId: newFan.id,
			});
		}
	}

	return newFan;
}
