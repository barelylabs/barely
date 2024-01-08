import { generateOpenApiDocument } from 'trpc-openapi';

import { APP_BASE_URL } from '../../utils/constants';
import { edgeRouter } from './router.edge';

/* 👇 */
export const openApiDocument = generateOpenApiDocument(edgeRouter, {
	title: 'tRPC OpenAPI',
	version: '1.0.0',
	baseUrl: APP_BASE_URL,
});
