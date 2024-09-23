import { tasks } from '@trigger.dev/sdk/v3';
import { and, asc, desc, eq, gt, inArray, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import type { importFansFromCsv } from '../../../trigger/fan.trigger';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import {
	createFanSchema,
	// importFansFromCsvColumnMappingsSchema,
	importFansFromCsvSchema,
	selectWorkspaceFansSchema,
	updateFanSchema,
} from './fan.schema';
import { Fans } from './fan.sql';

export const fanRouter = createTRPCRouter({
	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceFansSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search } = input;
			const fans = await ctx.db.http.query.Fans.findMany({
				where: sqlAnd([
					eq(Fans.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(Fans.fullName, search),
					!!cursor &&
						or(
							lt(Fans.createdAt, cursor.createdAt),
							and(eq(Fans.createdAt, cursor.createdAt), gt(Fans.id, cursor.id)),
						),
				]),
				orderBy: [desc(Fans.createdAt), asc(Fans.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (fans.length > limit) {
				const nextFan = fans.pop();
				nextCursor =
					nextFan ?
						{
							id: nextFan.id,
							createdAt: nextFan.createdAt,
						}
					:	undefined;
			}

			return {
				fans,
				nextCursor,
			};
		}),

	generateCsvMapping: privateProcedure
		.input(
			z.object({
				fieldColumns: z.array(z.string()),
				firstRows: z.array(
					z.record(z.union([z.string(), z.number(), z.boolean()]).nullable()),
				),
			}),
		)
		.mutation(async ({ input }) => {
			const { fieldColumns, firstRows } = input;

			const { generateCsvMapping } = await import('./fan.ai');

			const csvMapping = await generateCsvMapping(fieldColumns, firstRows);

			return csvMapping;
		}),

	importFromCsv: privateProcedure
		.input(importFansFromCsvSchema)
		.mutation(async ({ input }) => {
			const { csvFileId, optIntoEmailMarketing, optIntoSmsMarketing, ...columnMappings } =
				input;
			await tasks.trigger<typeof importFansFromCsv>('import-fans-from-csv', {
				csvFileId,
				columnMappings,
				optIntoEmailMarketing,
				optIntoSmsMarketing,
			});
		}),

	create: privateProcedure.input(createFanSchema).mutation(async ({ input, ctx }) => {
		const fanData = {
			...input,
			id: newId('fan'),
			workspaceId: ctx.workspace.id,
		};

		const fans = await ctx.db.pool.insert(Fans).values(fanData).returning();
		const fan = fans[0] ?? raise('Failed to create fan');

		return fan;
	}),

	update: privateProcedure.input(updateFanSchema).mutation(async ({ input, ctx }) => {
		const { id, ...data } = input;

		const updatedFans = await ctx.db.pool
			.update(Fans)
			.set(data)
			.where(eq(Fans.id, id))
			.returning();

		return updatedFans[0] ?? raise('Failed to update fan');
	}),

	archive: privateProcedure
		.input(z.array(z.string()))
		.mutation(async ({ input, ctx }) => {
			const updatedFans = await ctx.db.http
				.update(Fans)
				.set({ archivedAt: new Date() })
				.where(and(eq(Fans.workspaceId, ctx.workspace.id), inArray(Fans.id, input)))
				.returning();

			return updatedFans[0] ?? raise('Failed to archive fans');
		}),

	delete: privateProcedure.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
		const updatedFans = await ctx.db.http
			.update(Fans)
			.set({ deletedAt: new Date() })
			.where(and(eq(Fans.workspaceId, ctx.workspace.id), inArray(Fans.id, input)))
			.returning();

		return updatedFans[0] ?? raise('Failed to delete fans');
	}),
});
