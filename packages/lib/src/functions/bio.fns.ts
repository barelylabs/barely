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
	const bioRaw = await dbHttp.query.Bios.findFirst({
		where: and(eq(Bios.handle, handle), eq(Bios.key, key), isNull(Bios.deletedAt)),
		with: {
			workspace: {
				columns: {
					id: true,
					name: true,
					handle: true,
					imageUrl: true,
				},
				with: {
					_avatarImages: {
						where: (avatarImage, { eq }) => eq(avatarImage.current, true),
						with: {
							file: true,
						},
					},
					brandKit: {
						columns: {
							id: false,
							createdAt: false,
							updatedAt: false,
							archivedAt: false,
							deletedAt: false,
						},
					},
				},
			},
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

	if (!bioRaw) {
		return null;
	}

	const { bioBlocks, workspace: workspaceRaw, ...bio } = bioRaw;

	const blocks = bioBlocks
		.map(bb => ({
			...bb.bioBlock,
			lexoRank: bb.lexoRank,
			links: bb.bioBlock.bioLinks
				.map(bl => ({
					...bl.bioLink,
					lexoRank: bl.lexoRank,
					blockId: bl.bioBlockId,
					link: bl.bioLink.link,
				}))
				.sort((a, b) => a.lexoRank.localeCompare(b.lexoRank)),
		}))
		.sort((a, b) => a.lexoRank.localeCompare(b.lexoRank));

	const { brandKit, _avatarImages, ...workspace } = workspaceRaw;
	const avatarImage = _avatarImages[0]?.file;

	return {
		...bio,
		blocks,
		brandKit,
		workspace,
		avatarImage,
	};
}
