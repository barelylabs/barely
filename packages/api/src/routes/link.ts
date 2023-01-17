import { router, publicProcedure, privateProcedure } from '../trpc';
import { z } from 'zod';
import { linkBaseSchema } from '../../../schema/db/link';
import { appTypeSchema } from '../../../schema/db/apptype';
import { remarketingBaseSchema } from '../../../schema/db/remarketing';

const linkByPathSchema = z.object({
	handle: z.string(),
	slug: z.preprocess(slug => slug ?? null, z.string().nullable()),
	app: z.preprocess(app => app ?? null, appTypeSchema.nullable()),
	appRoute: z.preprocess(appRoute => appRoute ?? null, z.string().nullable()),
	appId: z.preprocess(appId => appId ?? null, z.string().nullable()),
});

export const linkWithRemarketingSchema = linkBaseSchema
	.extend({
		remarketingEndpoints: z.array(remarketingBaseSchema),
	})
	.partial();

export type LinkWithRemarketing = z.infer<typeof linkWithRemarketingSchema>;

export const linkRouter = router({
	getAll: publicProcedure.query(({ ctx }) => {
		return ctx.prisma.link.findMany({ take: 10 });
	}),
	getByArtistId: privateProcedure
		.input(z.array(z.string()).optional())
		.query(({ ctx, input }) => {
			return ctx.prisma.link.findMany({
				where: input?.length
					? { artistId: { in: input } }
					: {
							artist: { ownerId: ctx.user.id } || {
								userRoles: { some: { user: { id: ctx.user.id } } },
							},
					  },
				include: {
					_count: { select: { events: { where: { type: 'linkClick' } } } },
				},
				take: 20,
			});
		}),

	getById: publicProcedure.input(z.string()).query(({ ctx, input }) => {
		{
			const link = ctx.prisma.link.findFirst({ where: { id: input } });
			return link;
		}
	}),
	// getByPath: procedure
	//   .meta({ openapi: { method: "GET", path: "/link/by-path" } })
	//   .input(linkByPathSchema)
	//   .output(z.lazy(() => linkWithRemarketingSchema.partial()))
	//   .query(async ({ ctx, input }) => {
	//     const { handle, slug, app, appRoute, appId } = input;
	//     const link = await ctx.prisma.link.findFirst({
	//       where: { handle, slug, app, appRoute, appId },
	//       select: {
	//         id: true,
	//         url: true,
	//         artist: {
	//           select: { remarketing: { select: { remarketing: true } } },
	//         },
	//         trackApp: { select: { track: { select: { spotifyId: true } } } },
	//         androidScheme: true,
	//         appleScheme: true,
	//         ogTitle: true,
	//         ogDescription: true,
	//         ogImage: true,
	//         favicon: true,
	//       },
	//     });

	//     if (!link) {
	//       throw new TRPCError({
	//         code: "NOT_FOUND",
	//         message: `sorry, we couldn't find that link`,
	//       });
	//     }

	//     const remarketingEndpoints =
	//       link.artist?.remarketing.map((r) => r.remarketing) ?? [];
	//     const { artist, ...linkWithoutArtist } = link;
	//     const linkWithRemarketing = {
	//       ...linkWithoutArtist,
	//       remarketingEndpoints,
	//     };
	//     return linkWithRemarketing;
	//   }),
});
