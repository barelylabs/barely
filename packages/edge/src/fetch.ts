import { z, ZodType } from 'zod';

// interface Schema extends ZodType {}

// interface FetchProps {
// 	endpoint: string;
// 	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
// 	contentType?: 'application/json' | 'application/x-www-form-urlencoded';
// 	authorization?: string;
// 	headers?: Record<string, string>;
// 	body?: Record<string, string>;
// 	schemaReq?: ZodType;
// 	schemaRes?: ZodType;
// }

type FetchInput<Schema extends ZodType> = {
	endpoint: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	headers?: Record<string, string>;
	// contentType?: 'application/json' | 'application/x-www-form-urlencoded';
	authorization?: string;
	// body?: Record<string, string | boolean | undefined>;
	schemaReq?: Schema;
	schemaRes?: Schema;
} & (
	| { contentType?: 'application/json'; body?: object }
	| { contentType: 'application/x-www-form-urlencoded'; body: Record<string, string> }
);

type FetchOutput<Schema extends ZodType> = {
	res?: Response;
	json?: z.infer<Schema>;
	error?: any;
	error_description?: any;
};

async function _fetch<Schema extends ZodType>(
	f: FetchInput<Schema>,
): Promise<FetchOutput<Schema>> {
	const { endpoint, method, contentType, authorization } = f;
	const { headers, body, schemaReq, schemaRes } = f;

	// body &&
	// 	Object.keys(body).forEach(key => {
	// 		if (!body[key]) delete body[key];
	// 	});

	try {
		const res = await fetch(endpoint, {
			method: method ?? 'GET',
			headers: {
				'Content-Type': contentType ?? 'application/json',
				Authorization: authorization ?? '',
				...headers,
			},
			body:
				body && contentType === 'application/x-www-form-urlencoded'
					? new URLSearchParams(body as Record<string, string>).toString() //fixme -- it's not ideal to cast the type here.
					: JSON.stringify(schemaReq === undefined ? body : schemaReq.parse(body)),
		});

		const json = await res.json();
		console.log('json => ', json);
		const parsedJson = schemaRes === undefined ? json : schemaRes.parse(json);
		console.log('parsedJson => ', parsedJson);

		return {
			res,
			json: parsedJson,
			error: parsedJson.error ?? undefined,
			error_description: parsedJson.error_description ?? undefined,
		};
	} catch (err: any) {
		return { error: err.message };
	}
}

export async function get<Schema extends ZodType>(
	f: FetchInput<Schema>,
): Promise<FetchOutput<Schema>> {
	return await _fetch({ ...f, method: 'GET' });
}

export async function post<Schema extends ZodType>(
	f: FetchInput<Schema>,
): Promise<FetchOutput<Schema>> {
	return await _fetch({ ...f, method: 'POST' });
}
