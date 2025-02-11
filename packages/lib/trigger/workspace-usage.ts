import { task } from '@trigger.dev/sdk/v3';
import { gte, or } from 'drizzle-orm';

import { dbHttp } from '../server/db';
import { Workspaces } from '../server/routes/workspace/workspace.sql';

export const resetWorkspaceUsage = task({
	id: 'reset-workspace-usage',
	run: async () => {
		await dbHttp
			.update(Workspaces)
			.set({
				eventUsage: 0,
				emailUsage: 0,
				linkUsage: 0,
				fileUsage_billingCycle: 0,
			})
			.where(
				or(
					gte(Workspaces.eventUsage, 0),
					gte(Workspaces.emailUsage, 0),
					gte(Workspaces.linkUsage, 0),
					gte(Workspaces.fileUsage_billingCycle, 0),
				),
			); // reset the event usage to 0 for all workspaces that have anyusage
	},
});
