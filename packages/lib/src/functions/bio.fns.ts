import { dbHttp } from '@barely/db/client';
import { _BioBlocks_To_Bios, _BioLinks_To_BioBlocks, Bios } from '@barely/db/sql/bio.sql';
import { and, asc, eq, isNull } from 'drizzle-orm';

export async function getBioByHandleAndKey({
	handle,
	key,
}: {
	handle: string;
	key: string;
}) {
	const bio = await dbHttp.query.Bios.findFirst({
		where: and(eq(Bios.handle, handle), eq(Bios.key, key), isNull(Bios.deletedAt)),
	});

	return bio ?? null;
}

export async function getBioBlocksByHandleAndKey({
	handle,
	key,
}: {
	handle: string;
	key: string;
}) {
	const bioWithBlocks = await dbHttp.query.Bios.findFirst({
		where: and(eq(Bios.handle, handle), eq(Bios.key, key)),
		columns: {
			id: true,
		},
		with: {
			bioBlocks: {
				with: {
					bioBlock: {
						with: {
							bioLinks: {
								with: {
									bioLink: {
										with: {
											link: true,
											form: true,
											_image: {
												with: {
													file: {
														columns: {
															id: true,
															s3Key: true,
															blurDataUrl: true,
															name: true,
															width: true,
															height: true,
														},
													},
												},
											},
										},
									},
								},
								orderBy: [asc(_BioLinks_To_BioBlocks.lexoRank)],
							},
						},
					},
				},
				orderBy: [asc(_BioBlocks_To_Bios.lexoRank)],
			},
		},
	});

	const blocks =
		bioWithBlocks?.bioBlocks.map(bb => ({
			...bb.bioBlock,
			lexoRank: bb.lexoRank,
			links: bb.bioBlock.bioLinks.map(bl => {
				// Get the first image (we only support one image per link)
				const imageRelation = bl.bioLink._image[0];
				const imageFile = imageRelation?.file;

				return {
					...bl.bioLink,
					lexoRank: bl.lexoRank,
					blockId: bl.bioBlockId,
					link: bl.bioLink.link,
					image:
						imageFile ?
							{
								id: imageFile.id,
								s3Key: imageFile.s3Key,
								blurDataUrl: imageFile.blurDataUrl,
								name: imageFile.name,
								width: imageFile.width,
								height: imageFile.height,
							}
						:	null,
				};
			}),
		})) ?? [];

	return blocks;
}

export type PublicBioBlock = Awaited<ReturnType<typeof getBioBlocksByHandleAndKey>>;
