'use server';

import sharp from 'sharp';

import { env } from '../../../env';

function bufferToBase64(buffer: Buffer): string {
	return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function getBuffer(url: string) {
	const response = await fetch(url);
	return Buffer.from(await response.arrayBuffer());
}

export async function getBlurHash(s3Key: string) {
	try {
		const lowResImage = await getBuffer(
			`https://${env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN}/${s3Key}?format=jpeg&width=48&quality=50`,
		);

		const resizedBuffer = await sharp(lowResImage).resize(20).toBuffer();
		return bufferToBase64(resizedBuffer);
	} catch {
		return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOsa2yqBwAFCAICLICSyQAAAABJRU5ErkJggg==';
	}
}
