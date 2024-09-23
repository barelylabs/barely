import { Readable } from 'node:stream';
import { task } from '@trigger.dev/sdk/v3';
// import * as csv from '@fast-csv/parse'
// import { parse } from '@fast-csv/parse';
import { parse } from 'csv-parse';
import { eq } from 'drizzle-orm';
import fetch from 'node-fetch';
import { z } from 'zod';

import type {
	importFansFromCsvColumnMappingsSchema,
	InsertFan,
} from '../server/routes/fan/fan.schema';
import { dbPool } from '../server/db/pool';
import { insertFanSchema } from '../server/routes/fan/fan.schema';
import { Fans } from '../server/routes/fan/fan.sql';
import { Files } from '../server/routes/file/file.sql';
import { newId } from '../utils/id';
import { getFullNameFromFirstAndLast, parseFullName } from '../utils/name';

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
		const csvFileRecord = await dbPool.query.Files.findFirst({
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

		const parser = Readable.from(response.body).pipe(
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

			const rec = z.record(z.string().optional()).parse(record);

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
				createdAt =
					typeof rec[columnMappings.createdAt] === 'string' ?
						new Date(rec[columnMappings.createdAt]!)
					:	new Date();
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

		const chunkSize = 50;
		for (let i = 0; i < fanRecords.length; i += chunkSize) {
			const chunk = fanRecords.slice(i, i + chunkSize);
			console.log('chunk[0]', chunk[0]);
			console.log('chunk[chunk.length - 1]', chunk[chunk.length - 1]);
			await dbPool.insert(Fans).values(chunk).onConflictDoNothing(); // fixme: better to fill in missing values on conflict?
		}

		return { importedFansCount: fanRecords.length };
	},
});
