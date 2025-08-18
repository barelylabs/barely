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
			links: bb.bioBlock.bioLinks.map(bl => ({
				...bl.bioLink,
				lexoRank: bl.lexoRank,
				blockId: bl.bioBlockId,
				link: bl.bioLink.link,
			})),
		})) ?? [];

	return blocks;
}

export type PublicBioBlock = Awaited<ReturnType<typeof getBioBlocksByHandleAndKey>>;
