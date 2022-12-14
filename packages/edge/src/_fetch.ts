import { z, ZodType } from 'zod';

export async function get<Schema extends ZodType>(
	endpoint: string,
	schema: Schema
): Promise<z.infer<Schema>> {
	const res = await fetch(endpoint);
	const json = await res.json();
	return schema.parse(json);
}

export async function post<Schema extends ZodType>({
	endpoint,
	body,
	schemaRes,
}: {
	endpoint: string;
	schemaRes: Schema;
	body: unknown;
}): Promise<z.infer<Schema>> {
	try {
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
		const json = await res.json();
		return schemaRes.parse(json);
	} catch (err: any) {
		return { error: err.message };
	}
}
