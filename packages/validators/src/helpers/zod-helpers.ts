import type { ZodType } from 'zod/v4';
import { sha256 as shaJs256 } from 'sha.js';
import { z } from 'zod/v4';

export const queryBooleanSchema = z.preprocess(v => {
	if (typeof v === 'string') {
		if (v === 'true') return true;
		if (v === 'false') return false;
	}
	return v;
}, z.boolean());

export const optionalString_EmptyToUndefined = z.preprocess(v => {
	if (typeof v === 'string' && v.length === 0) return undefined;
	return v;
}, z.string().optional());

export const nullableString_EmptyToNull = z.preprocess(v => {
	if (typeof v === 'string' && v.length === 0) return null;
	return v;
}, z.string().nullable());

export const z_optStr_hash = z
	.string()
	.transform(str => new shaJs256().update(str).digest('hex'))
	.optional();

export const z_optStr_lowerCase_hash = z
	.string()
	.optional()
	.transform(s => new shaJs256().update((s ?? '').toLowerCase()).digest('hex'))
	.optional();

export const z_optUrl = z
	.url()
	.or(z.literal(''))
	.transform(v => (v === '' ? undefined : v))
	.optional();

// json

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

type Literal = z.infer<typeof literalSchema>;

type Json = Literal | { [key: string]: Json } | Json[];

const jsonSchema: z.ZodType<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(jsonSchema), z.record(z.string(), jsonSchema)]),
);

export const z_stringToJson = z
	.string()
	.transform((str, ctx): z.infer<typeof jsonSchema> => {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return JSON.parse(str);
		} catch (e) {
			console.log('e', e);
			ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
			return z.NEVER;
		}
	});

export function stringToJSON<Schema extends ZodType>(
	str: string,
	schema: Schema,
): z.infer<Schema> {
	const json = z_stringToJson.safeParse(str);

	if (!json.success) throw new Error(json.error.message);

	const parsed = schema.safeParse(json.data);

	if (!parsed.success) throw new Error(parsed.error.message);

	return parsed.data;
}

export function stringToJSONSafe<Schema extends ZodType>(
	str: string,
	schema: Schema,
): { success: true; data: z.infer<Schema> } | { success: false; error: z.ZodError } {
	const json = z_stringToJson.safeParse(str);

	if (!json.success)
		return {
			success: false,
			error: json.error,
		};

	const parsed = schema.safeParse(json.data);

	if (!parsed.success)
		return {
			success: false,
			error: parsed.error,
		};

	return {
		success: true,

		data: parsed.data,
	};
}

export const queryNumberArraySchema = z
	.string()
	.or(z.number())
	.or(z.array(z.number()))
	.transform(a => {
		if (typeof a === 'string') return a.split(',').map(a => Number(a));
		if (Array.isArray(a)) return a;
		return [a];
	});

export const queryStringArraySchema = z
	.string()
	.or(z.array(z.string()))
	.transform(a => {
		if (typeof a === 'string') return a.split(',');
		if (Array.isArray(a)) return a;
		return [a];
	});

export const queryStringEnumArraySchema = <T extends readonly [string, ...string[]]>(
	enumValues: T,
) =>
	z
		.string()
		.or(z.array(z.enum(enumValues)))
		.transform(a => {
			console.log('enumValues', a);

			if (typeof a === 'string') {
				const array = a.split(',');
				const invalidValues = array.filter(
					value => !enumValues.includes(value as T[number]),
				);
				if (invalidValues.length > 0)
					throw new Error(`Invalid enum values: ${invalidValues.join(', ')}`);
				return array as T[number][];
			}
			if (Array.isArray(a)) return a;

			// check if all values are in the enum
			// const invalidValues = a.filter(value => !enumValues.includes(value as T[number]));
			// if (invalidValues.length > 0) throw new Error(`Invalid enum values: ${invalidValues.join(', ')}`);

			return a;
		});

export const queryStringArrayToCommaString = z
	.string()
	.or(z.array(z.string()))
	.transform(a => {
		if (typeof a === 'string') return a;
		if (Array.isArray(a)) return a.join(',');
		return a;
	});

export const queryStringEnumArrayToCommaString = <
	T extends readonly [string, ...string[]],
>(
	enumValues: T,
) =>
	z
		.string()
		.or(z.array(z.enum(enumValues)))
		.transform(a => {
			if (typeof a === 'string') {
				// convert string to array, check enum, and join array to string
				const array = a.split(',');
				const parsedArray = array.map(value => {
					if (enumValues.includes(value as T[number])) return value;
					throw new Error(`Invalid enum value: ${value}`);
				});
				return parsedArray.join(',');
			}
			if (Array.isArray(a)) return a.join(',');
			return a;
		});

export const querySelectionSchema = z.union([z.literal('all'), queryStringArraySchema]);
