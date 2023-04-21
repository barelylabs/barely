// import {
// 	storyBoardCreateSchema,
// 	storyCreateSchema,
// 	storyUpdateSchema,
// } from '@barely/lib/schema/db';
// import { getLexoRank } from '@barely/lib/utils';
// import { TRPCError } from '@trpc/server';
// import { z } from 'zod';

import { prisma } from '@barely/db';

import { privateProcedure, router } from '../trpc';

export const storyBoardRouter = router({
	// add: privateProcedure.input(storyBoardCreateSchema).mutation(async ({ ctx, input }) => {
	// 	return await prisma.storyBoard.create({
	// 		data: {
	// 			name: input.name,
	// 			createdBy: { connect: { id: ctx.user.id } },
	// 			members: { connect: { id: ctx.user.id } },
	// 			color: input.color,
	// 		},
	// 	});
	// }),

	byUser: privateProcedure.query(async ({ ctx }) => {
		return await prisma.storyBoard.findMany({
			take: 20,
			where: {
				OR: [
					{ createdBy: { id: ctx.user.id } },
					{ members: { some: { id: ctx.user.id } } },
				],
			},
		});
	}),
});

export const storyColumnRouter = router({
	// add: privateProcedure
	// 	.input(z.object({ boardId: z.string(), name: z.string() }))
	// 	.mutation(async ({ ctx, input }) => {
	// 		const lastColumn = await prisma.storyColumn.findFirst({
	// 			where: { boardId: input.boardId },
	// 			select: { lexoRank: true },
	// 			orderBy: { lexoRank: 'desc' },
	// 		});
	// 		const rank = lastColumn
	// 			? getLexoRank.afterLast(lastColumn.lexoRank)
	// 			: getLexoRank.middle();
	// 		return await prisma.storyColumn.create({
	// 			data: {
	// 				board: { connect: { id: input.boardId } },
	// 				name: input.name,
	// 				lexoRank: rank,
	// 			},
	// 		});
	// 	}),
	// update: privateProcedure
	// 	.input(
	// 		z.object({
	// 			id: z.string(),
	// 			name: z.string(),
	// 			lexo: z.union([
	// 				z.object({
	// 					updateRank: z.literal(true),
	// 					beforeColumnId: z.string().nullable(),
	// 					afterColumnId: z.string().nullable(),
	// 				}),
	// 				z.object({ updateRank: z.literal(false).optional() }),
	// 			]),
	// 		}),
	// 	)
	// 	.mutation(async ({ ctx, input }) => {
	// 		let lexoRank: string | undefined;
	// 		if (input.lexo.updateRank) {
	// 			const betweenColumns = await prisma.storyColumn.findMany({
	// 				where: {
	// 					OR: [
	// 						{ id: input.lexo.beforeColumnId ?? undefined },
	// 						{ id: input.lexo.afterColumnId ?? undefined },
	// 					],
	// 				},
	// 				select: { lexoRank: true, boardId: true },
	// 			});
	// 			if (
	// 				betweenColumns[0]?.boardId !== undefined &&
	// 				betweenColumns[0]?.boardId !== betweenColumns[1]?.boardId
	// 			)
	// 				throw new TRPCError({
	// 					code: 'BAD_REQUEST',
	// 					message: "Those columns aren't on the same board",
	// 				});
	// 			lexoRank = getLexoRank.between(
	// 				betweenColumns[0]?.lexoRank,
	// 				betweenColumns[1]?.lexoRank,
	// 			);
	// 		}
	// 		return await prisma.storyColumn.update({
	// 			where: { id: input.id },
	// 			data: { name: input.name, lexoRank },
	// 		});
	// 	}),
	// byBoard: privateProcedure
	// 	.input(z.object({ id: z.string() }))
	// 	.query(async ({ ctx, input }) => {
	// 		return await prisma.storyColumn.findMany({
	// 			where: { boardId: input.id },
	// 			select: { id: true, lexoRank: true },
	// 			orderBy: { lexoRank: 'asc' },
	// 		});
	// 	}),
});

export const storyRouter = router({
	// byColumn: privateProcedure
	// 	.input(
	// 		z.object({
	// 			columnId: z.string(),
	// 			limit: z.number().min(1).max(100).optional(),
	// 		}),
	// 	)
	// 	.query(async ({ ctx, input }) => {
	// 		return await prisma.story.findMany({
	// 			where: { columnId: input.columnId },
	// 			select: { id: true, lexoRank: true },
	// 			orderBy: { lexoRank: 'asc' },
	// 			take: input.limit ?? 20,
	// 		});
	// 	}),
	// add: privateProcedure
	// 	.input(
	// 		storyCreateSchema.merge(
	// 			z.object({
	// 				lexo: z.union([
	// 					z.object({
	// 						position: z.literal('first'),
	// 					}),
	// 					z.object({
	// 						position: z.literal('last'),
	// 					}),
	// 					z.object({
	// 						position: z.literal('between'),
	// 						beforeStoryId: z.string().nullable(),
	// 						afterStoryId: z.string().nullable(),
	// 					}),
	// 				]),
	// 			}),
	// 		),
	// 	)
	// 	.mutation(async ({ ctx, input }) => {
	// 		let lexoRank: string | undefined;
	// 		if (input.lexo.position === 'first') {
	// 			const firstStory = await prisma.story.findFirst({
	// 				where: { columnId: input.columnId },
	// 				select: { lexoRank: true },
	// 				orderBy: { lexoRank: 'asc' },
	// 			});
	// 			lexoRank = firstStory
	// 				? getLexoRank.beforeFirst(firstStory?.lexoRank)
	// 				: (getLexoRank.middle() satisfies string);
	// 		}
	// 		if (input.lexo.position === 'last') {
	// 			const lastStory = await prisma.story.findFirst({
	// 				where: { columnId: input.columnId },
	// 				select: { lexoRank: true },
	// 				orderBy: { lexoRank: 'desc' },
	// 			});
	// 			lexoRank = lastStory
	// 				? getLexoRank.afterLast(lastStory?.lexoRank)
	// 				: (getLexoRank.middle() satisfies string);
	// 		}
	// 		if (input.lexo.position === 'between') {
	// 			const betweenStories = await prisma.story.findMany({
	// 				where: {
	// 					OR: [
	// 						{ id: input.lexo.beforeStoryId ?? undefined },
	// 						{ id: input.lexo.afterStoryId ?? undefined },
	// 					],
	// 				},
	// 				select: { lexoRank: true, columnId: true },
	// 			});
	// 			if (
	// 				betweenStories[0]?.columnId !== undefined &&
	// 				betweenStories[0]?.columnId !== betweenStories[1]?.columnId
	// 			)
	// 				throw new TRPCError({
	// 					code: 'BAD_REQUEST',
	// 					message: "Those stories aren't in the same column",
	// 				});
	// 			lexoRank = getLexoRank.between(
	// 				betweenStories[0]?.lexoRank,
	// 				betweenStories[1]?.lexoRank,
	// 			);
	// 		}
	// 		if (!lexoRank)
	// 			throw new TRPCError({
	// 				code: 'INTERNAL_SERVER_ERROR',
	// 				message: 'Invalid lexoRank',
	// 			});
	// 		return await prisma.story.create({
	// 			data: {
	// 				createdBy: { connect: { id: ctx.user.id } },
	// 				assignedTo: { connect: { id: input.assignedToId ?? undefined } },
	// 				forUser: { connect: { id: input.forUserId ?? undefined } },
	// 				epic: { connect: { id: input.epicId ?? undefined } },
	// 				column: { connect: { id: input.columnId } },
	// 				lexoRank,
	// 				name: input.name,
	// 				description: input.description,
	// 				dueDate: input.dueDate,
	// 				priority: input.priority,
	// 			},
	// 		});
	// 	}),
	// update: privateProcedure
	// .input(
	// 	storyUpdateSchema.merge(
	// 		z.object({
	// 			lexo: z.union([
	// 				z.object({
	// 					updateRank: z.literal(true),
	// 					beforeStoryId: z.string().nullable(),
	// 					afterStoryId: z.string().nullable(),
	// 				}),
	// 				z.object({ updateRank: z.literal(false).optional() }),
	// 			]),
	// 		}),
	// 	),
	// )
	// .mutation(async ({ ctx, input }) => {
	// 	let lexoRank: string | undefined;
	// 	if (input.lexo.updateRank) {
	// 		const betweenStories = await prisma.story.findMany({
	// 			where: {
	// 				OR: [
	// 					{ id: input.lexo.beforeStoryId ?? undefined },
	// 					{ id: input.lexo.afterStoryId ?? undefined },
	// 				],
	// 			},
	// 			select: { lexoRank: true, columnId: true },
	// 		});
	// 		if (
	// 			betweenStories[0]?.columnId !== undefined &&
	// 			betweenStories[0]?.columnId !== betweenStories[1]?.columnId
	// 		)
	// 			throw new TRPCError({
	// 				code: 'BAD_REQUEST',
	// 				message: "Those stories aren't in the same column",
	// 			});
	// 		lexoRank = getLexoRank.between(
	// 			betweenStories[0]?.lexoRank,
	// 			betweenStories[1]?.lexoRank,
	// 		);
	// 	}
	// 	return await prisma.story.update({
	// 		where: { id: input.id },
	// 		data: {
	// 			...input,
	// 			lexoRank,
	// 			// assignedTo: { connect: { id: input.assignedToId ?? undefined } },
	// 			// artist: { connect: { id: input.artistId ?? undefined } },
	// 			// epic: { connect: { id: input.epicId ?? undefined } },
	// 			// column: { connect: { id: input.columnId } },
	// 			// name: input.name,
	// 			// description: input.description,
	// 			// dueDate: input.dueDate,
	// 			// priority: input.priority,
	// 		},
	// 	});
	// }),
});
