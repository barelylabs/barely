import { dbHttp } from '@barely/db/client';
import { Workspaces } from '@barely/db/sql';
import { schedules } from '@trigger.dev/sdk/v3';
import { gte, or } from 'drizzle-orm';

export const resetWorkspaceUsage = schedules.task({
	id: 'reset-workspace-usage',

	run: async () => {
		// console.log('Resetting workspace usage (console)', { payload, ctx });
		// logger.log('Resetting workspace usage (logger)');

		await dbHttp
			.update(Workspaces)
			.set({
				eventUsage: 0,
				emailUsage: 0,
				linkUsage: 0,
				invoiceUsage: 0,
				fileUsage_billingCycle: 0,
			})
			.where(
				or(
					gte(Workspaces.eventUsage, 0),
					gte(Workspaces.emailUsage, 0),
					gte(Workspaces.linkUsage, 0),
					gte(Workspaces.invoiceUsage, 0),
					gte(Workspaces.fileUsage_billingCycle, 0),
				),
			); // reset the usage to 0 for all workspaces that have any usage
	},
});
