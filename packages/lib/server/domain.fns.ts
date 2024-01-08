import { eq, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import env from '../env';
import { validDomainRegex } from '../utils/domain';
import { getApexDomain, getDomainWithoutWWW } from '../utils/link';
import { sqlStringEndsWith } from '../utils/sql';
import { zDelete, zGet, zPost } from '../utils/zod-fetch';
import { db } from './db';
import { Domain } from './domain.schema';
import { Domains } from './domain.sql';

export async function validateDomain(domain: string) {
	if (!domain ?? typeof domain !== 'string' ?? domain.length === 0) {
		return {
			valid: false,
			error: 'Missing domain',
		};
	}

	const validDomain = validDomainRegex.test(domain);

	if (!validDomain) {
		return {
			valid: false,
			error: 'Invalid domain',
		};
	}

	const exists = await domainExists(domain);
	if (exists) {
		return {
			valid: false,
			error: 'Domain already exists',
		};
	}

	return {
		valid: true,
		error: null,
	};
}

export async function domainExists(domain: string) {
	const existingDomain = await db.read.query.Domains.findFirst({
		where: eq(Domains.domain, domain),
		columns: {
			domain: true,
		},
	});

	return !!existingDomain;
}

export function barelyDomainPrice(cost: number) {
	let markup = cost * 0.5;
	if (markup < 10) {
		markup = 10;
	} else if (markup > 100) {
		markup = 100;
	}
	return Math.ceil((cost + markup) / 10) * 10;
}

// fixme: figure out how we store images on Cloudinary first...
/* Change the domain for all images for a given workspace on Cloudinary */
/* dub.co ref below */
/* export async function changeDomainForImages(domain: string, newDomain: string) {
  const links = await prisma.link.findMany({
    where: {
      domain,
    },
    select: {
      key: true,
    },
  });
  if (links.length === 0) return null;
  try {
    return await Promise.all(
      links.map(({ key }) =>
        cloudinary.v2.uploader.rename(
          `${domain}/${key}`,
          `${newDomain}/${key}`,
          {
            invalidate: true,
          },
        ),
      ),
    );
  } catch (e) {
    return null;
  }
} */

/* Delete a domain and all links & images associated with with */
/* dub.co ref below */
/* export async function deleteDomainAndLinks(
  domain: string,
  {
    // Note: in certain cases, we don't need to remove the domain from the Prisma
    skipPrismaDelete = false,
  } = {},
) {
  const links = await prisma.link.findMany({
    where: {
      domain,
    },
  });
  const pipeline = redis.pipeline();
  links.forEach(({ key }) => {
    pipeline.del(`${domain}:${key}`);
  });
  pipeline.del(`root:${domain}`);
  return await Promise.allSettled([
    pipeline.exec(), // delete all links from redis
    // remove all images from cloudinary
    cloudinary.v2.api.delete_resources_by_prefix(domain),
    // remove the domain from Vercel
    removeDomainFromVercel(domain),
    !skipPrismaDelete &&
      prisma.domain.delete({
        where: {
          slug: domain,
        },
      }),
  ]);
} */

// vercel

export function getVercelProjectIdForDomainType(type: Domain['type']) {
	if (type === 'link') {
		return env.VERCEL_LINK_PROJECT_ID;
	} else if (type === 'bio') {
		return null; // fixme: when we have a bio project, add it here
	} else if (type === 'press') {
		return null; // fixme: when we have a press project, add it here
	}
}

export async function addDomainToVercel(props: {
	domain: string;
	type: Domain['type'];
	redirectToApex?: boolean;
}) {
	const projectId = getVercelProjectIdForDomainType(props.type);

	if (!projectId) {
		throw new Error('No Vercel project ID found for domain type');
	}

	const res = await zPost(
		`https://api.vercel.com/v10/projects/${projectId}/domains?teamId=${env.VERCEL_TEAM_ID}`,
		z.object({
			name: z.string(),
			apexName: z.string(),
			projectId: z.string(),
			redirect: z.string().nullish(),
			redirectStatusCode: z
				.union([z.literal(307), z.literal(301), z.literal(302), z.literal(308)])
				.nullish(),
			gitBranch: z.string().nullish(),
			updatedAt: z.number().optional(),
			createdAt: z.number().optional(),
			verified: z.boolean(),
			verification: z
				.array(
					z.object({
						type: z.string(),
						domain: z.string(),
						value: z.string(),
						reason: z.string(),
					}),
				)
				.optional(),
		}),
		{
			auth: `Bearer ${env.VERCEL_TOKEN}`,
			body: {
				name: props.domain,
				redirect: props.redirectToApex ? getDomainWithoutWWW(props.domain) : undefined,
			},
		},
	);

	return res;
}

export async function removeDomainFromVercel(props: {
	domain: string;
	type: Domain['type'];
}) {
	const projectId = getVercelProjectIdForDomainType(props.type);

	if (!projectId) {
		throw new Error('No Vercel project ID found for domain type');
	}

	const apexDomain = getApexDomain(`https://${props.domain}`);
	const domainCount = await db.read
		.select({
			count: sql<number>`cast(count(${Domains.domain}) as int)`,
		})
		.from(Domains)
		.where(
			or(
				eq(Domains.domain, apexDomain),
				sqlStringEndsWith(Domains.domain, `.${apexDomain}`),
				// sql`${Domains.domain} LIKE ${'%.' + apexDomain}`,
			),
		)
		.then(res => res[0]?.count ?? 0);

	if (domainCount > 1) {
		// the apex domain is being used by other domains
		// so we should only remove it from our Vercel project
		const vercelResponse = await zDelete(
			`https://api.vercel.com/v9/projects/${projectId}/domains/${props.domain}?teamId=${env.VERCEL_TEAM_ID}`,
			z.object({}),
			{
				auth: `Bearer ${env.VERCEL_TOKEN}`,
			},
		);

		return vercelResponse;
	} else {
		// this is the only domain using this apex domain
		// so we can remove it entirely from our Vercel team
		const vercelResponse = await zDelete(
			`https://api.vercel.com/v6/domains/${props.domain}?teamId=${env.VERCEL_TEAM_ID}`,
			z.object({}),
			{ auth: `Bearer ${env.VERCEL_TOKEN}` },
		);

		return vercelResponse;
	}
}

export async function getDomainResponseFromVercel(props: {
	domain: string;
	type: Domain['type'];
}) {
	const projectId = getVercelProjectIdForDomainType(props.type);

	if (!projectId) {
		throw new Error('No Vercel project ID found for domain type');
	}

	const vercelResponse = await zGet(
		`https://api.vercel.com/v9/projects/${projectId}/domains/${props.domain}?teamId=${env.VERCEL_TEAM_ID}`,
		z.object({
			name: z.string(),
			apexName: z.string(),
			projectId: z.string(),
			redirect: z.string().nullish(),
			redirectStatusCode: z
				.union([z.literal(307), z.literal(301), z.literal(302), z.literal(308)])
				.nullish(),
			gitBranch: z.string().nullish(),
			updatedAt: z.number().optional(),
			createdAt: z.number().optional(),
			verified: z.boolean(),
			verification: z
				.array(
					z.object({
						type: z.string(),
						domain: z.string(),
						value: z.string(),
						reason: z.string(),
					}),
				)
				.optional(),
		}),
		{
			auth: `Bearer ${env.VERCEL_TOKEN}`,
			errorSchema: z.object({
				error: z.object({
					code: z.string(),
					message: z.string(),
				}),
			}),
		},
	);

	return vercelResponse;
}

export async function getDomainConfigFromVercel(domain: string) {
	const vercelResponse = await zGet(
		`https://api.vercel.com/v6/domains/${domain}/config?teamId=${env.VERCEL_TEAM_ID}`,
		z.object({
			configuredBy: z
				.union([z.literal('CNAME'), z.literal('A'), z.literal('http'), z.null()])
				.optional(),
			acceptedChallenges: z
				.array(z.union([z.literal('dns-01'), z.literal('http-01')]))
				.optional(),
			misconfigured: z.boolean(),
			conflicts: z.array(
				z.object({
					name: z.string(),
					type: z.string(),
					value: z.string(),
				}),
			),
		}),
		{
			auth: `Bearer ${env.VERCEL_TOKEN}`,
			errorSchema: z.object({
				error: z.object({
					code: z.string(),
					message: z.string(),
				}),
			}),
			// logResponse: true,
		},
	);

	return vercelResponse;
}

export async function verifyDomainOnVercel(props: {
	domain: string;
	type: Domain['type'];
}) {
	const projectId = getVercelProjectIdForDomainType(props.type);

	if (!projectId) {
		throw new Error('No Vercel project ID found for domain type');
	}

	const vercelResponse = await zPost(
		`https://api.vercel.com/v9/projects/${projectId}/domains/${props.domain}/verify?teamId=${env.VERCEL_TEAM_ID}`,
		z.object({
			name: z.string(),
			apexName: z.string(),
			projectId: z.string(),
			redirect: z.string().nullish(),
			redirectStatusCode: z
				.union([z.literal(307), z.literal(301), z.literal(302), z.literal(308)])
				.nullish(),
			gitBranch: z.string().nullish(),
			updatedAt: z.number().optional(),
			createdAt: z.number().optional(),
			verified: z.boolean(),
			verification: z
				.array(
					z.object({
						type: z.string(),
						domain: z.string(),
						value: z.string(),
						reason: z.string(),
					}),
				)
				.optional(),
		}),
		{
			auth: `Bearer ${env.VERCEL_TOKEN}`,
			errorSchema: z.object({
				error: z.object({
					code: z.string(),
					message: z.string(),
				}),
			}),
		},
	);

	return vercelResponse;
}

// gandi (check available domains and purchase)

interface AvailableDomain {
	domain: string;
	available: true;
	price?: number;
	premium?: string;
	duration?: number;
}

interface UnavailableDomain {
	domain: string;
	available: false;
}

export async function getDomainsAvailable(domains: string[]) {
	const gandiApiKey = env.GANDI_API_KEY;
	const gandiApiUrl = 'https://api.sandbox.gandi.net/v5';

	const availableDomains: AvailableDomain[] = [];
	const unavailableDomains: UnavailableDomain[] = [];

	const checkDomainResSchema = z.object({
		grid: z.string(),
		currency: z.string(),
		taxes: z
			.array(
				z.object({
					name: z.string(),
					type: z.string(),
					rate: z.number(),
				}),
			)
			.optional(),
		products: z
			.array(
				z.object({
					name: z.string(),
					status: z.string(),
					process: z.string(),
					taxes: z.array(
						z.object({
							name: z.string(),
							type: z.string(),
							rate: z.number(),
						}),
					),
					prices: z.array(
						z.object({
							duration_unit: z.string(),
							min_duration: z.number(),
							max_duration: z.number(),
							price_before_taxes: z.number(),
							price_after_taxes: z.number(),
							discount: z.boolean(),
							options: z.object({
								period: z.string(),
							}),
						}),
					),
				}),
			)
			.optional(),
	});

	await Promise.allSettled(
		domains.map(async domain => {
			const apexDomain = getApexDomain(domain);

			const res = await zGet(
				`${gandiApiUrl}/domain/check?name=${apexDomain}&currency=USD`,
				checkDomainResSchema,
				{ auth: `Bearer ${gandiApiKey}` },
			);

			// check if domain is available
			if (
				res.success &&
				res.parsed &&
				res.data.products?.some(product => product.status === 'available')
			) {
				const product = res.data.products?.find(
					product => product.status === 'available',
				);
				const price = product?.prices[0]?.price_after_taxes
					? barelyDomainPrice(product?.prices[0]?.price_after_taxes)
					: undefined;
				const duration = product?.prices[0]?.min_duration;

				if (!price || !duration) {
					return unavailableDomains.push({
						domain,
						available: false,
					});
				}
				availableDomains.push({
					domain,
					available: true,
					price,
					duration,
				});
			} else {
				unavailableDomains.push({
					domain,
					available: false,
				});
			}
		}),
	);

	return {
		availableDomains,
		unavailableDomains,
	};
}
