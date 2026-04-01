import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';
import SuperJSON from 'superjson';

export const makeQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 5 * 60 * 1000, // 5 minutes - mutations invalidate caches explicitly
			},
			dehydrate: {
				serializeData: SuperJSON.serialize,
				shouldDehydrateQuery: query =>
					defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
				shouldRedactErrors: () => {
					// We should not catch Next.js server errors
					// as that's how Next.js detects dynamic pages
					// so we cannot redact them.
					// Next.js also automatically redacts errors for us
					// with better digests.
					return false;
				},
			},
			hydrate: {
				deserializeData: SuperJSON.deserialize,
			},
		},
	});
