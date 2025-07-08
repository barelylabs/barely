// ref: https://github.com/dubinc/dub/blob/e4ad71bc418dbdfe7666bfc389b6fe0ed1d5b976/apps/web/lib/ai/generate-csv-mapping.ts#L8

import { anthropic } from '@ai-sdk/anthropic';
import { importFansFromCsvColumnMappingsSchema_zodv3 } from '@barely/validators/schemas';
import { generateObject } from 'ai';

export async function generateCsvMapping(
	fieldColumns: string[],
	firstRows: Record<string, unknown>[],
) {
	const { object } = await generateObject({
		model: anthropic('claude-4-sonnet-20250514'),
		schema: importFansFromCsvColumnMappingsSchema_zodv3,
		prompt:
			`The following columns are the headings from a CSV import file for importing a company's fans. ` +
			`Map these column names to the correct fields in our database (firstName, lastName, fullName, email, phoneNumber, createdAt) by providing the matching column name for each field.` +
			`You may also consult the first few rows of data to help you make the mapping, but you are mapping the columns, not the values. ` +
			`If you are not sure or there is no matching column, omit the value.\n\n` +
			`Columns:\n${fieldColumns.join(',')}\n\n` +
			`First few rows of data:\n` +
			firstRows.map(row => JSON.stringify(row)).join('\n'),
		temperature: 0.2,
	});

	return object;
}
