import { generateOpenApiDocument } from 'trpc-openapi';

import env from '../env';
import { nodeRouter } from './node.router';

/* 👇 */
export const openApiDocument = generateOpenApiDocument(nodeRouter, {
	title: 'tRPC OpenAPI',
	version: '1.0.0',
	baseUrl: env.NEXT_PUBLIC_APP_BASE_URL,
});
