import { TRPCError } from '@trpc/server';
import { and, eq, not } from 'drizzle-orm';
import { z } from 'zod';

import { privateProcedure, router } from './api';
import { addDomainToVercel, removeDomainFromVercel } from './domain.fns';
import { changeDomainForLinkImages } from './domain.fns.node';
import { createDomainSchema, updateDomainSchema } from './domain.schema';
import { Domains } from './domain.sql';

// using node runtime to access cloudinary

export const domainNodeRouter = router({
	add: privateProcedure.input(createDomainSchema).mutation(async ({ input, ctx }) => {
		// 1. Add domain to Vercel
		const vercelResponse = await addDomainToVercel({
			domain: input.domain,
			type: input.type,
		});

		if (!vercelResponse.success) {
			console.log('vercelResponse => ', vercelResponse.data);

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'there was an error adding the domain to vercel',
			}); //fixme break out error codes in addLinkDomainToVercel
		}

		console.log('domain added to vercel => ', vercelResponse.status);

		// 2. If the domain is being set as the primary link domain, set all other domains to not be the primary link domain
		if (input.isPrimaryLinkDomain) {
			await ctx.db.writePool
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
		await ctx.db.writePool.insert(Domains).values({
			...input,
			workspaceId: ctx.workspace.id,
		});
	}),

	update: privateProcedure.input(updateDomainSchema).mutation(async ({ input, ctx }) => {
		// get domain from db
		const existingDomain = await ctx.db.read.query.Domains.findFirst({
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
					ctx.db.writePool
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
				ctx.db.writePool
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
				ctx.db.writePool
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
				ctx.db.writePool
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
				// update links to use new domain
				changeDomainForLinkImages({
					oldDomain: existingDomain.domain,
					newDomain: input.domain,
				}),
			]);
		}

		// update domain in database
		await ctx.db.writePool
			.update(Domains)
			.set(input)
			.where(
				and(eq(Domains.workspaceId, ctx.workspace.id), eq(Domains.domain, input.domain)),
			);
	}),

	delete: privateProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
		const domain = await ctx.db.read.query.Domains.findFirst({
			where: and(eq(Domains.workspaceId, ctx.workspace.id), eq(Domains.domain, input)),
		});

		if (!domain) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: `Domain ${input} not found`,
			});
		}

		/** 1. Remove domain from Vercel */
		const vercelResponse = await removeDomainFromVercel({
			domain: input,
			type: domain.type,
		});

		if (!vercelResponse.success) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
			}); //fixme break out error codes in removeLinkDomainToVercel
		}

		console.log('domain removed from vercel => ', vercelResponse.status);

		/** 2. Delete domain from database */
		await ctx.db.writePool
			.delete(Domains)
			.where(and(eq(Domains.workspaceId, ctx.workspace.id), eq(Domains.domain, input)));

		/** 3. Delete any links that are using this domain.
		 * This should be done automatically via cascading foreign keys
		 * */
	}),
});
