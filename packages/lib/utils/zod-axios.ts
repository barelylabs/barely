/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import axios from 'axios';
import { z, ZodType } from 'zod';

type ZFetchProps<Schema extends ZodType> = {
	schema: Schema;
	endpoint: string;
	headers?: Record<string, string>;
	auth?: string;
} & (
	| { contentType?: 'application/json'; body?: object }
	| { contentType: 'application/x-www-form-urlencoded'; body: object }
);
// | { contentType: 'application/x-www-form-urlencoded'; body: Record<string, string> }

//* GET *//

async function zGet<Schema extends ZodType>(
	props: ZFetchProps<Schema>,
): Promise<z.infer<Schema>> {
	const { endpoint, headers, auth, contentType, schema } = props;

	const res = await axios
		.get(endpoint, {
			headers: {
				...headers,
				authorization: auth ?? '',
				'Content-Type': contentType ?? 'application/json',
			},
			responseType: contentType === 'application/x-www-form-urlencoded' ? 'text' : 'json',
		})
		.then(res => {
			const parsed = schema.parse(res.data);
			return { data: parsed };
		})
		.catch(err => {
			console.error('zGet err => ', err);
			throw new Error('zGet err');
		});

	return res.data;
}

// post

async function zPost<Schema extends ZodType>(
	props: ZFetchProps<Schema>,
): Promise<z.infer<Schema>> {
	const { endpoint, headers, body, auth, contentType, schema: schema } = props;

	const res = await axios
		.post(endpoint, body, {
			headers: {
				...headers,
				authorization: auth ?? '',
				'Content-Type': contentType ?? 'application/json',
			},
			responseType: contentType === 'application/x-www-form-urlencoded' ? 'text' : 'json',
		})

		.then(res => {
			console.log('zPost res.data => ', res.data);
			console.log('typeof res.data => ', typeof res.data);
			// if (contentType === 'application/x-www-form-urlencoded') {
			// 	console.log('zPost res.data => ', JSON.parse(res.data as string));
			// }

			const dataToParse =
				contentType === 'application/x-www-form-urlencoded'
					? JSON.parse(res.data as string)
					: res.data;

			console.log('dataToParse => ', dataToParse);
			console.log('typeof dataToParse => ', typeof dataToParse);

			const parsed = schema.parse(dataToParse);
			return { data: parsed };
		})

		.catch(err => {
			console.error('zPost err => ', err);
			throw new Error('zPost err');
		});

	return res.data;
}

export { zGet, zPost };
