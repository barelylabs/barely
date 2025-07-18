import type { DomainStatus } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { Domains } from '@barely/db/sql/domain.sql';
import { createDomainSchema, updateDomainSchema } from '@barely/validators';
import { TRPCError } from '@trpc/server';
import { and, eq, not } from 'drizzle-orm';
import { z } from 'zod/v4';

import { libEnv } from '../../../env';
import {
	addDomainToVercel,
	getDomainConfigFromVercel,
	getDomainResponseFromVercel,
	getDomainsAvailable,
	removeDomainFromVercel,
	verifyDomainOnVercel,
} from '../../functions/domain.fns';
import { publicProcedure, workspaceProcedure } from '../trpc';

export const domainRoute = {
	add: workspaceProcedure.input(createDomainSchema).mutation(async ({ input, ctx }) => {
		// 1. Add domain to Vercel
		const vercelResponse = await addDomainToVercel({
			domain: input.domain,
			type: input.type,
		});

		if (!vercelResponse.success) {
			console.log('vercelResponse => ', vercelResponse.data);

			if (
				vercelResponse.parsed &&
				vercelResponse.data.error.code === 'domain_already_in_use'
			) {
				console.log('domain already in use. skipping adding domain to vercel');
			} else {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'there was an error adding the domain to vercel',
				});
			}
		}

		console.log('domain added to vercel => ', vercelResponse.status);

		// 2. If the domain is being set as the primary link domain, set all other domains to not be the primary link domain
		if (input.isPrimaryLinkDomain) {
			await dbPool(ctx.pool)
				.update(Domains)
				.set({ isPrimaryLinkDomain: false })
				.where(
					and(
						eq(Domains.workspaceId, ctx.workspace.id),
						eq(Domains.isPrimaryLinkDomain, true),
						not(eq(Domains.domain, input.domain)),
					),
				);
		}

		// 3. Add domain to database
		await dbPool(ctx.pool)
			.insert(Domains)
			.values({
				...input,
				workspaceId: ctx.workspace.id,
			});
	}),

	update: workspaceProcedure
		.input(updateDomainSchema)
		.mutation(async ({ input, ctx }) => {
			// get domain from db
			const existingDomain = await dbHttp.query.Domains.findFirst({
				where: and(
					eq(Domains.workspaceId, ctx.workspace.id),
					eq(Domains.domain, input.domain),
				),
			});

			if (!existingDomain) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: `Domain ${input.domain} not found`,
				});
			}

			if (input.type !== existingDomain.type) {
				await Promise.allSettled([
					/** if the type is changing from a link to a bio or press domain, we need to:
					 * delete any existing links
					 * */
					existingDomain.type === 'link' &&
						dbPool(ctx.pool)
							.delete(Domains)
							.where(
								and(
									eq(Domains.workspaceId, ctx.workspace.id),
									eq(Domains.domain, existingDomain.domain),
								),
							),
				]);
			}

			// handle being set as a primary domain
			await Promise.allSettled([
				/** if the domain is being set as the primary link domain:
				 * set all other domains to not be the primary link domain
				 */
				input.isPrimaryLinkDomain &&
					!existingDomain.isPrimaryLinkDomain &&
					dbPool(ctx.pool)
						.update(Domains)
						.set({ isPrimaryLinkDomain: false })
						.where(
							and(
								eq(Domains.workspaceId, ctx.workspace.id),
								eq(Domains.isPrimaryLinkDomain, true),
								not(eq(Domains.domain, input.domain)),
							),
						),

				/** if the domain is being set as the primary bio domain:
				 * set all other domains to not be the primary bio domain
				 */
				input.isPrimaryBioDomain &&
					!existingDomain.isPrimaryBioDomain &&
					dbPool(ctx.pool)
						.update(Domains)
						.set({ isPrimaryBioDomain: false })
						.where(
							and(
								eq(Domains.workspaceId, ctx.workspace.id),
								eq(Domains.isPrimaryBioDomain, true),
								not(eq(Domains.domain, input.domain)),
							),
						),

				/** if the domain is being set as the primary press domain:
				 * set all other domains to not be the primary press domain
				 */
				input.isPrimaryPressDomain &&
					!existingDomain.isPrimaryPressDomain &&
					dbPool(ctx.pool)
						.update(Domains)
						.set({ isPrimaryPressDomain: false })
						.where(
							and(
								eq(Domains.workspaceId, ctx.workspace.id),
								eq(Domains.isPrimaryPressDomain, true),
								not(eq(Domains.domain, input.domain)),
							),
						),
			]);

			/** if the domain itself is being changed (e.g. properyouth.link -> properyou.th), we need to
			 * 1. remove the old domain from vercel
			 * 2. add the new domain to vercel
			 * 3. Update all links that are using the old domain to use the new domain (this should be be done automatically via cascading foreign keys?)
			 * 4. Update all images in the project to point to the new domain: // todo
			 */

			if (input.domain !== existingDomain.domain) {
				await Promise.allSettled([
					// remove domain from vercel
					removeDomainFromVercel({
						domain: existingDomain.domain,
						type: existingDomain.type,
					}),
					// add domain to vercel
					addDomainToVercel({
						domain: input.domain,
						type: input.type,
					}),
				]);
			}

			// update domain in database
			await dbPool(ctx.pool)
				.update(Domains)
				.set(input)
				.where(
					and(
						eq(Domains.workspaceId, ctx.workspace.id),
						eq(Domains.domain, input.domain),
					),
				);
		}),

	delete: workspaceProcedure
		.input(z.object({ domain: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const domain = await dbHttp.query.Domains.findFirst({
				where: and(
					eq(Domains.workspaceId, ctx.workspace.id),
					eq(Domains.domain, input.domain),
				),
			});

			if (!domain) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: `Domain ${input.domain} not found`,
				});
			}

			/** 1. Remove domain from Vercel */
			const vercelResponse = await removeDomainFromVercel({
				domain: input.domain,
				type: domain.type,
			});

			if (!vercelResponse.success) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
				}); //fixme break out error codes in removeLinkDomainToVercel
			}

			console.log('domain removed from vercel => ', vercelResponse.status);

			/** 2. Delete domain from database */
			await dbPool(ctx.pool)
				.delete(Domains)
				.where(
					and(
						eq(Domains.workspaceId, ctx.workspace.id),
						eq(Domains.domain, input.domain),
					),
				);

			/** 3. Delete any links that are using this domain.
			 * This should be done automatically via cascading foreign keys
			 * */
		}),

	byDomain: workspaceProcedure
		.input(z.object({ domain: z.string() }))
		.query(async ({ input, ctx }) => {
			const domain = await dbHttp.query.Domains.findFirst({
				where: and(
					eq(Domains.workspaceId, ctx.workspace.id),
					eq(Domains.domain, input.domain),
				),
			});

			return domain;
		}),

	byWorkspace: workspaceProcedure.query(async ({ ctx }) => {
		const domains = await dbPool(ctx.pool).query.Domains.findMany({
			where: eq(Domains.workspaceId, ctx.workspace.id),
			orderBy: (domains, { desc }) => [desc(domains.isPrimaryLinkDomain)],
		});

		return domains;
	}),

	verifyOnVercel: workspaceProcedure
		.input(z.object({ domain: z.string() }))
		.query(async ({ input, ctx }) => {
			let status: DomainStatus = 'Valid Configuration';

			const domain = await dbHttp.query.Domains.findFirst({
				where: and(
					eq(Domains.workspaceId, ctx.workspace.id),
					eq(Domains.domain, input.domain),
				),
			});

			if (!domain) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: `Domain ${input.domain} not found`,
				});
			}

			const vercelDomainResponse = await getDomainResponseFromVercel({
				domain: input.domain,
				type: domain.type,
			});

			const vercelConfigResponse = await getDomainConfigFromVercel(input.domain);

			/**
			 * Domain not found on Vercel project
			 */

			if (
				!vercelDomainResponse.success &&
				vercelDomainResponse.parsed &&
				vercelDomainResponse.data.error.code === 'not_found'
			) {
				// domain not found on Vercel project
				status = 'Domain Not Found';
				console.log('domain not found on vercel project => ', vercelDomainResponse.data);
				return {
					status,
					vercelDomainResponse: vercelDomainResponse,
					vercelConfigResponse: vercelConfigResponse,
				};
			}

			/**
			 * Unknown error
			 */

			if (!vercelDomainResponse.success && vercelDomainResponse.parsed) {
				status = 'Unknown Error';
				return {
					status,
					vercelDomainResponse: vercelDomainResponse,
					vercelConfigResponse: vercelConfigResponse,
				};
			}

			/**
			 * Domain has DNS conflicts
			 */
			if (
				vercelConfigResponse.success &&
				vercelConfigResponse.parsed &&
				vercelConfigResponse.data.conflicts.length > 0
			) {
				status = 'Conflicting DNS Records';
				return {
					status,
					vercelDomainResponse: vercelDomainResponse,
					vercelConfigResponse: vercelConfigResponse,
				};
			}

			/**
			 * If domain is not verified, we try to verify now
			 */
			if (
				vercelDomainResponse.success &&
				vercelDomainResponse.parsed &&
				!vercelDomainResponse.data.verified
			) {
				status = 'Pending Verification';
				const verifyResponse = await verifyDomainOnVercel({
					domain: input.domain,
					// projectId: domain.type === 'link' ? env.VERCEL_LINK_PROJECT_ID : '', //fixme - add env var for bio and press
					type: domain.type,
				});

				console.log('verify response => ', verifyResponse.data);

				if (
					verifyResponse.success &&
					verifyResponse.parsed &&
					verifyResponse.data.verified
				) {
					/* Domain was just verified */
					status = 'Valid Configuration';
					try {
						await dbPool(ctx.pool)
							.update(Domains)
							.set({ verified: true })
							.where(
								and(
									eq(Domains.workspaceId, ctx.workspace.id),
									eq(Domains.domain, input.domain),
								),
							);
					} catch (error) {
						console.error('Error updating domain verification status:', error);
						// Don't throw the error, just log it - the verification itself succeeded
					}
				}

				return {
					status,
					vercelDomainResponse: vercelDomainResponse,
					vercelConfigResponse: vercelConfigResponse,
					verifyResponse: verifyResponse,
				};
			}

			/**
			 * The domain is verified and has no DNS conflicts
			 * Now we just check if the domain has the correct configuration
			 * */
			if (vercelConfigResponse.success && vercelConfigResponse.parsed) {
				const { data } = vercelConfigResponse;

				try {
					if (!data.misconfigured) {
						await dbPool(ctx.pool)
							.update(Domains)
							.set({ verified: true, lastCheckedAt: new Date() })
							.where(
								and(
									eq(Domains.workspaceId, ctx.workspace.id),
									eq(Domains.domain, input.domain),
								),
							);
					} else {
						status = 'Invalid Configuration';
						await dbPool(ctx.pool)
							.update(Domains)
							.set({ verified: false, lastCheckedAt: new Date() })
							.where(
								and(
									eq(Domains.workspaceId, ctx.workspace.id),
									eq(Domains.domain, input.domain),
								),
							);
					}
				} catch (error) {
					console.error('Error updating domain verification status:', error);
					// Don't throw the error, just log it - the verification status check itself succeeded
				}
			}

			return {
				status,
				vercelDomainResponse: vercelDomainResponse,
				vercelConfigResponse: vercelConfigResponse,
			};
		}),

	getAvailableToPurchase: publicProcedure
		.input(z.object({ domain: z.string() }))
		.query(async ({ input }) => {
			const availability = await getDomainsAvailable([input.domain]);

			return {
				domain: input.domain,
				available: availability.availableDomains.length > 0,
				price: availability.availableDomains[0]?.price,
				duration: availability.availableDomains[0]?.duration,
			};
		}),

	getSuggestedLinkDomainsToPurchase: publicProcedure
		.input(z.object({ handle: z.string().optional() }))
		.query(async ({ input }) => {
			const handle = input.handle;

			if (!handle) {
				return [];
			}

			const domainsToCheck =
				libEnv.NEXT_PUBLIC_VERCEL_ENV === 'production' ?
					[
						`${handle}.link`,
						`${handle}.to`,
						`${handle}.co`,
						`${handle}.rocks`,
						`${handle}.tv`,
						`${handle}.info`,
						`${handle}.io`,
					]
				:	[`${handle}.com`, `${handle}.net`, `${handle}.org`, `${handle}.fr`];

			const domains = await getDomainsAvailable(domainsToCheck);

			// console.log('checkedDomains => ', domains);

			const orderedDomains = domains.availableDomains.sort(
				(a, b) => domainsToCheck.indexOf(a.domain) - domainsToCheck.indexOf(b.domain),
			);

			return orderedDomains;
		}),
} satisfies TRPCRouterRecord;
