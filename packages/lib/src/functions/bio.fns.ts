import { dbHttp } from '@barely/db/client';
import {
	_BioBlocks_To_Bios,
	_BioLinks_To_BioBlocks,
	_Files_To_BioLinks__Images,
	Bios,
} from '@barely/db/sql/bio.sql';
import { and, asc, eq, isNull } from 'drizzle-orm';

export async function getBioByHandleAndKey({
	handle,
	key,
}: {
	handle: string;
	key: string;
}) {
	const [bio] = await dbHttp
		.select()
		.from(Bios)
		.where(and(eq(Bios.handle, handle), eq(Bios.key, key), isNull(Bios.deletedAt)))
		.limit(1)
		.$withCache();

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
							imageFile: {
								columns: {
									id: true,
									s3Key: true,
									blurDataUrl: true,
									name: true,
									width: true,
									height: true,
								},
							},
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
							targetCartFunnel: {
								with: {
									mainProduct: {
										with: {
											_images: {
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
							},
							targetLink: true,
							targetBio: true,
							targetFm: true,
							learnMoreBio: true,
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
					form: bl.bioLink.form, // Include form explicitly for clarity
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
			imageFile: bb.bioBlock.imageFile,
			targetCartFunnel: bb.bioBlock.targetCartFunnel,
			targetLink: bb.bioBlock.targetLink,
			targetBio: bb.bioBlock.targetBio,
			targetFm: bb.bioBlock.targetFm,
			learnMoreBio: bb.bioBlock.learnMoreBio,
		})) ?? [];

	return blocks;
}

export type PublicBioBlock = Awaited<ReturnType<typeof getBioBlocksByHandleAndKey>>;
