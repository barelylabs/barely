import { appRouter } from '../../router';

import { generateOpenApiDocument } from 'trpc-openapi';
import type {} from 'openapi-types';

import { baseUrl } from '@barely/edge';

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
	title: '@barely open api',
	description: 'OpenAPI compliant REST API built using tRPC with Next.js',
	version: '1.0.0',
	baseUrl: `${baseUrl.get()}/api/open`,
	docsUrl: 'https://github.com/jlalmes/trpc-openapi',
	tags: ['auth', 'users', 'posts'],
});
