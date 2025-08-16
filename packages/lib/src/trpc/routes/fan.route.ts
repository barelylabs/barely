import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { Fans } from '@barely/db/sql';
import { sqlAnd, sqlCount, sqlStringContains } from '@barely/db/utils';
import { newId, raiseTRPCError } from '@barely/utils';
import {
	createFanSchema,
	exportFansSchema,
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
		const fan = fans[0] ?? raiseTRPCError({ message: 'Failed to create fan' });

		return fan;
	}),

	update: workspaceProcedure.input(updateFanSchema).mutation(async ({ input, ctx }) => {
		const { id, ...data } = input;

		const updatedFans = await dbPool(ctx.pool)
			.update(Fans)
			.set(data)
			.where(eq(Fans.id, id))
			.returning();

		return updatedFans[0] ?? raiseTRPCError({ message: 'Failed to update fan' });
	}),

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedFans = await dbHttp
				.update(Fans)
				.set({ archivedAt: new Date() })
				.where(and(eq(Fans.workspaceId, ctx.workspace.id), inArray(Fans.id, input.ids)))
				.returning();

			return updatedFans[0] ?? raiseTRPCError({ message: 'Failed to archive fans' });
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedFans = await dbHttp
				.update(Fans)
				.set({ deletedAt: new Date() })
				.where(and(eq(Fans.workspaceId, ctx.workspace.id), inArray(Fans.id, input.ids)))
				.returning();

			return updatedFans[0] ?? raiseTRPCError({ message: 'Failed to delete fans' });
		}),

	exportToCsv: workspaceProcedure
		.input(exportFansSchema)
		.mutation(async ({ input, ctx }) => {
			const { format, filters, includeArchived, fields } = input;

			const MAX_EXPORT_RECORDS = 10000;

			// Fetch all fans with optional filters
			const fans = await dbHttp.query.Fans.findMany({
				where: sqlAnd([
					eq(Fans.workspaceId, ctx.workspace.id),
					!!filters?.search?.length && sqlStringContains(Fans.fullName, filters.search),
					!includeArchived ? isNull(Fans.archivedAt) : undefined,
				]),
				orderBy: [desc(Fans.createdAt), asc(Fans.id)],
				limit: MAX_EXPORT_RECORDS + 1, // Fetch one extra to check if we hit the limit
			});

			// Check if we exceeded the limit
			if (fans.length > MAX_EXPORT_RECORDS) {
				const { TRPCError } = await import('@trpc/server');
				throw new TRPCError({
					code: 'PAYLOAD_TOO_LARGE',
					message: `Export limited to ${MAX_EXPORT_RECORDS.toLocaleString()} fans. Please use filters to reduce the number of fans or contact support for bulk exports.`,
				});
			}

			// Import the CSV generation utility
			const { generateFansCSV, generateExportFilename } = await import(
				'../../utils/fan-export'
			);

			// Generate CSV content
			const csvContent = generateFansCSV(fans, format, fields);
			const filename = generateExportFilename(format, ctx.workspace.name);

			return {
				csvContent,
				filename,
				totalRecords: fans.length,
			};
		}),
} satisfies TRPCRouterRecord;
