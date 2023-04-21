/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// import axios from 'axios';
import { z, ZodType } from 'zod';

type ZFetchProps<Schema extends ZodType> = {
	schema: Schema;
	endpoint: string;
	headers?: Record<string, string>;
	auth?: string;
} & (
	| { contentType?: 'application/json'; body?: object }
	| { contentType: 'application/x-www-form-urlencoded'; body: Record<string, string> }
);
// | { contentType: 'application/x-www-form-urlencoded'; body: Record<string, string> }

//* GET *//

async function zGet<Schema extends ZodType>(
	props: ZFetchProps<Schema>,
): Promise<z.infer<Schema>> {
	const { endpoint, headers, auth, contentType, schema } = props;

	const response = await fetch(endpoint, {
		method: 'GET',
		headers: {
			...headers,
			authorization: auth ?? '',
			'Content-Type': contentType ?? 'application/json',
		},
	})
		.then(res => res.json())
		.then(data => {
			console.log('zGet res.data => ', data);
			const parsed = schema.parse(data);
			return { data: parsed };
		})
		.catch(err => {
			console.error('zGet err => ', err);
			throw new Error('zGet err');
		});

	return response.data;
}

// post

async function zPost<Schema extends ZodType>(
	props: ZFetchProps<Schema>,
): Promise<z.infer<Schema>> {
	const { endpoint, headers, body, auth, contentType, schema: schema } = props;

	const response = await fetch(endpoint, {
		method: 'POST',
		headers: {
			...headers,
			authorization: auth ?? '',
			'Content-Type': contentType ?? 'application/json',
		},
		body:
			contentType === 'application/x-www-form-urlencoded'
				? new URLSearchParams(body)
				: JSON.stringify(body),
	})
		.then(res => res.json())
		.then(data => {
			console.log('zPost res.data => ', data);
			console.log('typeof res.data => ', typeof data);

			const parsed = schema.parse(data);
			return { data: parsed };
		})

		.catch(err => {
			console.error('zPost err => ', err);
			throw new Error('zPost err');
		});

	return response.data;
}

// delete

async function zDelete<Schema extends ZodType>(
	props: ZFetchProps<Schema>,
): Promise<z.infer<Schema>> {
	const { endpoint, headers, body, auth, contentType, schema } = props;

	const response = await fetch(endpoint, {
		method: 'DELETE',
		headers: {
			...headers,
			authorization: auth ?? '',
			'Content-Type': contentType ?? 'application/json',
		},
		body:
			contentType === 'application/x-www-form-urlencoded'
				? new URLSearchParams(body)
				: JSON.stringify(body),
	})
		.then(res => res.json())
		.then(data => {
			console.log('zDelete res.data => ', data);
			const parsed = schema.parse(data);
			return { data: parsed };
		})

		.catch(err => {
			console.error('zDelete err => ', err);
			throw new Error('zDelete err');
		});

	return response.data;
}

export { zGet, zPost, zDelete };
