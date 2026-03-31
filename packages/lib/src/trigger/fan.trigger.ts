import { Readable } from 'node:stream';
import type {
	importFansFromCsvColumnMappingsSchema,
	InsertFan,
} from '@barely/validators';
import { dbHttp } from '@barely/db/client';
import { Fans, Files } from '@barely/db/sql';
import { getFullNameFromFirstAndLast, newId, parseFullName } from '@barely/utils';
import { insertFanSchema } from '@barely/validators';
import { task, tasks } from '@trigger.dev/sdk';
import { parse } from 'csv-parse';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { sendUsageWarning } from './workspace-usage';
import { checkUsageLimit, getBlockedMessage } from '../functions/usage.fns';

export const importFansFromCsv = task({
	id: 'import-fans-from-csv',
	run: async ({
		csvFileId,
		columnMappings,
		optIntoEmailMarketing,
		optIntoSmsMarketing,
	}: {
		csvFileId: string;
		columnMappings: z.infer<typeof importFansFromCsvColumnMappingsSchema>;
		optIntoEmailMarketing: boolean;
		optIntoSmsMarketing: boolean;
	}) => {
		const csvFileRecord = await dbHttp.query.Files.findFirst({
			where: eq(Files.id, csvFileId),
		});

		if (!csvFileRecord) {
			throw new Error('CSV file not found');
		}

		const { src, workspaceId } = csvFileRecord;

		const fanRecords: InsertFan[] = [];

		const response = await fetch(src);
		if (!response.ok) {
			throw new Error('Failed to fetch CSV file');
		}

		if (!response.body) {
			throw new Error('Response body is null');
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
		const nodeStream = Readable.fromWeb(response.body as any);
		const parser = nodeStream.pipe(
			parse({
				columns: true,
				skip_empty_lines: true,
				trim: true,
			}),
		);

		for await (const record of parser) {
			let firstName: unknown;
			let lastName: unknown;
			let fullName: unknown;
			let email: unknown;
			let phoneNumber: unknown;
			let createdAt: unknown;

			const rec = z.record(z.string(), z.string().optional()).parse(record);

			if (columnMappings.firstName) {
				firstName =
					typeof rec[columnMappings.firstName] === 'string' ?
						rec[columnMappings.firstName]
					:	'';
			}

			if (columnMappings.lastName) {
				lastName = rec[columnMappings.lastName];
			}

			if (columnMappings.fullName) {
				fullName =
					typeof rec[columnMappings.fullName] === 'string' ?
						rec[columnMappings.fullName]
					:	'';

				const { firstName: parsedFirstName, lastName: parsedLastName } = parseFullName(
					typeof fullName === 'string' ? fullName : '',
				);

				if (!columnMappings.firstName) {
					firstName = parsedFirstName;
				}

				if (!columnMappings.lastName) {
					lastName = parsedLastName;
				}
			} else {
				fullName = getFullNameFromFirstAndLast(
					typeof firstName === 'string' ? firstName : null,
					typeof lastName === 'string' ? lastName : null,
				);
			}

			if (columnMappings.email) {
				email =
					typeof rec[columnMappings.email] === 'string' ? rec[columnMappings.email] : '';
			}

			if (columnMappings.phoneNumber) {
				phoneNumber =
					typeof rec[columnMappings.phoneNumber] === 'string' ?
						rec[columnMappings.phoneNumber]
					:	'';
			}

			if (columnMappings.createdAt) {
				const dateString = rec[columnMappings.createdAt];
				if (typeof dateString === 'string') {
					createdAt = new Date(dateString);
				} else {
					createdAt = new Date();
				}
			}

			const insertFanRecord = insertFanSchema.safeParse({
				id: newId('fan'),
				workspaceId,
				firstName,
				lastName,
				fullName,
				email,
				phoneNumber,
				createdAt,

				emailMarketingOptIn: optIntoEmailMarketing,
				smsMarketingOptIn: optIntoSmsMarketing,
			});

			if (!insertFanRecord.success) {
				console.error(
					`Error parsing fan record: ${JSON.stringify(insertFanRecord.error.issues)}`,
				);
				continue;
			}

			fanRecords.push(insertFanRecord.data);
		}

		// Check usage limits before importing
		const usageResult = await checkUsageLimit(workspaceId, 'fans', fanRecords.length);

		// Hard block at 200% - reject entire import
		if (usageResult.status === 'blocked_200') {
			console.error(
				`Import blocked: Would exceed 200% of fan limit. Current: ${usageResult.current}, Limit: ${usageResult.limit}, Attempting to add: ${fanRecords.length}`,
			);
			throw new Error(
				getBlockedMessage('fans', usageResult.limit, 'your current') +
					` Import of ${fanRecords.length} fans was rejected.`,
			);
		}

		// Trigger warning email if needed (async)
		if (usageResult.shouldSendEmail) {
			const threshold =
				usageResult.status === 'warning_100' ? 100
				: usageResult.status === 'warning_80' ? 80
				: null;
			if (threshold) {
				console.log(
					`Triggering ${threshold}% usage warning email for workspace ${workspaceId}`,
				);
				void tasks.trigger<typeof sendUsageWarning>('send-usage-warning-email', {
					workspaceId,
					limitType: 'fans',
					threshold,
				});
			}
		}

		const chunkSize = 50;
		for (let i = 0; i < fanRecords.length; i += chunkSize) {
			const chunk = fanRecords.slice(i, i + chunkSize);
			console.log('chunk[0]', chunk[0]);
			console.log('chunk[chunk.length - 1]', chunk[chunk.length - 1]);
			await dbHttp.insert(Fans).values(chunk).onConflictDoNothing(); // fixme: better to fill in missing values on conflict?
		}

		return { importedFansCount: fanRecords.length };
	},
});
