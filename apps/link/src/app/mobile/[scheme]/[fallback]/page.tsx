import { z } from 'zod';

import ClientRedirect from './ClientRedirect';

export const dynamicParams = true;
export const runtime = 'experimental-edge';

const mobileRedirectParamsSchema = z.object({
	scheme: z.string(),
	fallback: z.string(),
	ogTitle: z.string().optional(),
	ogDescription: z.string().optional(),
	ogImage: z.string().optional(),
	favicon: z.string().optional(),
});
// type MobileRedirectParams = z.infer<typeof mobileRedirectParamsSchema>;

export default function MobileRedirectPage({
	params,
	searchParams,
}: {
	params: { scheme: string; fallback: string };
	searchParams?: Record<string, string | string[] | undefined>;
}) {
	const { scheme, fallback } = params;
	const { ogTitle, ogDescription, ogImage, favicon } =
		mobileRedirectParamsSchema.parse(searchParams);

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
