import { createTRPCRouter } from './api/trpc';

// import { meta } from '@barely/meta';
// import { geoSchema } from '../../../schema/next';

// import { z } from 'zod';
// import {
//   adPlatformSchema,
//   eventCreateSchema as eventCreateSchemaNeedsPatch,
//   eventReportCreateSchema as eventReportCreateSchemaNeedsPatch,
// } from "@barely/db/zod";
// import { eventBaseSchema } from "@barely/db/zod/event";
// import { remarketingBaseSchema } from "@barely/db/zod/remarketing";

// // 👇 fixme... these are temporary patches for partially required variables in zod 3.21.4.
// // 👇 Once patched, can just make required in the input. https://github.com/colinhacks/zod/issues/1550
// const eventCreateSchema = eventCreateSchemaNeedsPatch.merge(
//   z.object({ sessionId: z.string() }).required(),
// );
// const eventReportCreateSchema = eventReportCreateSchemaNeedsPatch.merge(
//   z
//     .object({
//       eventId: z.number(),
//       remarketingId: z.string(),
//       remarketingPlatform: adPlatformSchema,
//     })
//     .required(),
// );

// export const reportEventSchema = z.object({
//   url: z.string(),
//   eventId: z.number(),
//   geo: geoSchema.partial().optional(),
//   ip: z.string(),
//   ua: z.string(),
//   remarketingEndpoints: z.lazy(() => z.array(remarketingBaseSchema)), //z.array(remarketingBaseSchema),
// });

// export type ReportEventInput = z.infer<typeof reportEventSchema>;

export const eventRouter = createTRPCRouter({
	// getAll: procedure.query(({ ctx }) => {
	//   return prisma.artist.findMany({ take: 10 });
	// }),
	// create: publicProcedure
	// 	.meta({ openapi: { method: 'POST', path: '/event/create' } })
	// 	.input(eventCreateSchema)
	// 	.output(eventBaseSchema)
	// 	.mutation(async ({ ctx, input }) => {
	// 		const { type, linkId, bioId, buttonId, formId, sessionId } = input;
	// 		const event = await prisma.event.create({
	// 			data: {
	// 				type,
	// 				session: { connect: { id: sessionId } },
	// 				bio: bioId ? { connect: { id: bioId } } : undefined,
	// 				bioButton:
	// 					bioId && buttonId
	// 						? {
	// 								connect: {
	// 									bioId_buttonId: { bioId: bioId, buttonId: buttonId },
	// 								},
	// 						  }
	// 						: undefined,
	// 				form: formId ? { connect: { id: formId } } : undefined,
	// 				link: linkId ? { connect: { id: linkId } } : undefined,
	// 			},
	// 		});
	// 		return event;
	// 	}),
});
