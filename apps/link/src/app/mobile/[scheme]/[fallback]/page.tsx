import { z } from 'zod/v4';

import ClientRedirect from './ClientRedirect';

export const dynamicParams = true;
// export const runtime = 'experimental-edge';

const mobileRedirectParamsSchema = z.object({
	scheme: z.string(),
	fallback: z.string(),
	ogTitle: z.string().optional(),
	ogDescription: z.string().optional(),
	ogImage: z.string().optional(),
	favicon: z.string().optional(),
});
// type MobileRedirectParams = z.infer<typeof mobileRedirectParamsSchema>;

export default async function MobileRedirectPage({
	params,
	searchParams,
}: {
	params: Promise<{ scheme: string; fallback: string }>;
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const { scheme, fallback } = await params;
	const awaitedSearchParams = await searchParams;
	const { ogTitle, ogDescription, ogImage, favicon } =
		mobileRedirectParamsSchema.parse(awaitedSearchParams);

	return (
		<>
			{ogTitle ?
				<>
					<title>{ogTitle}</title>
					<meta property='og:title' content={decodeURIComponent(ogTitle)} />
				</>
			:	<title>barely.link</title>}

			{ogDescription && (
				<meta property='og:description' content={decodeURIComponent(ogDescription)} />
			)}

			{ogImage && <meta property='og:image' content={decodeURIComponent(ogImage)} />}
			{favicon && <link rel='icon' href={decodeURIComponent(favicon)} />}

			<ClientRedirect {...{ scheme, fallback }} />
		</>
	);
}
