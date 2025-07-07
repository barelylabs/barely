import { Readable } from 'node:stream';
import type {
	importFansFromCsvColumnMappingsSchema,
	InsertFan,
} from '@barely/validators';
import { dbHttp } from '@barely/db/client';
import { Fans, Files } from '@barely/db/sql';
import { getFullNameFromFirstAndLast, newId, parseFullName } from '@barely/utils';
import { insertFanSchema } from '@barely/validators';
import { task } from '@trigger.dev/sdk/v3';
import { parse } from 'csv-parse';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

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

		// Convert Web Stream to Node.js stream
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
