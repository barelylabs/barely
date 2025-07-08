import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { Fans } from '@barely/db/sql';
import { sqlAnd, sqlCount, sqlStringContains } from '@barely/db/utils';
import { newId, raise } from '@barely/utils';
import {
	createFanSchema,
	importFansFromCsvSchema,
	selectWorkspaceFansSchema,
	updateFanSchema,
} from '@barely/validators';
import { tasks } from '@trigger.dev/sdk/v3';
import { and, asc, desc, eq, gt, inArray, isNull, lt, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { importFansFromCsv } from '../../trigger';
import { privateProcedure, workspaceProcedure } from '../trpc';

export const fanRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceFansSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived } = input;
			const fans = await dbHttp.query.Fans.findMany({
				where: sqlAnd([
					eq(Fans.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(Fans.fullName, search),
					showArchived ? undefined : isNull(Fans.archivedAt),
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

	totalByWorkspace: workspaceProcedure.query(async ({ ctx }) => {
		const res = await dbHttp
			.select({
				count: sqlCount,
			})
			.from(Fans)
			.where(eq(Fans.workspaceId, ctx.workspace.id));

		return res[0]?.count ?? 0;
	}),

	generateCsvMapping: privateProcedure
		.input(
			z.object({
				fieldColumns: z.array(z.string()),
				firstRows: z.array(
					// z.record(z.union([z.string(), z.number(), z.boolean()]).nullable()),
					z.record(z.string(), z.string().nullable()),
				),
			}),
		)
		.mutation(async ({ input }) => {
			const { fieldColumns, firstRows } = input;

			const { generateCsvMapping } = await import('../../ai/fan.ai');

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

	create: workspaceProcedure.input(createFanSchema).mutation(async ({ input, ctx }) => {
		const fanData = {
			...input,
			id: newId('fan'),
			workspaceId: ctx.workspace.id,
		};

		const fans = await dbPool(ctx.pool).insert(Fans).values(fanData).returning();
		const fan = fans[0] ?? raise('Failed to create fan');

		return fan;
	}),

	update: workspaceProcedure.input(updateFanSchema).mutation(async ({ input, ctx }) => {
		const { id, ...data } = input;

		const updatedFans = await dbPool(ctx.pool)
			.update(Fans)
			.set(data)
			.where(eq(Fans.id, id))
			.returning();

		return updatedFans[0] ?? raise('Failed to update fan');
	}),

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedFans = await dbHttp
				.update(Fans)
				.set({ archivedAt: new Date() })
				.where(and(eq(Fans.workspaceId, ctx.workspace.id), inArray(Fans.id, input.ids)))
				.returning();

			return updatedFans[0] ?? raise('Failed to archive fans');
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedFans = await dbHttp
				.update(Fans)
				.set({ deletedAt: new Date() })
				.where(and(eq(Fans.workspaceId, ctx.workspace.id), inArray(Fans.id, input.ids)))
				.returning();

			return updatedFans[0] ?? raise('Failed to delete fans');
		}),
} satisfies TRPCRouterRecord;
