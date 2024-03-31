import { generateOpenApiDocument } from 'trpc-openapi';

import { getAbsoluteUrl } from '../../utils/url';
import { appRouter } from './router';

/* 👇 */
export const openApiDocument = generateOpenApiDocument(appRouter, {
	title: 'tRPC OpenAPI',
	version: '1.0.0',
	baseUrl: getAbsoluteUrl('app'),
});
