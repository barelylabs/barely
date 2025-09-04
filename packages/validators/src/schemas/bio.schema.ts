import type { _BioBlocks_To_Bios, _BioLinks_To_BioBlocks } from '@barely/db/sql';
import type { InferSelectModel } from 'drizzle-orm';
import { BIO_HEADER_STYLES } from '@barely/const';
import {
	_BioButtons_To_Bios,
	BioBlocks,
	BioButtons,
	BioLinks,
	Bios,
} from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import {
	commonFiltersSchema,
	infiniteQuerySchema,
	querySelectionSchema,
} from '../helpers';
import { stdWebEventPipeQueryParamsSchema } from './tb.schema';

// Bios
export const insertBioSchema = createInsertSchema(Bios, {
	handle: handle => handle.min(1, 'Handle is required'),
	key: key => key.min(1, 'Key is required'),
});

export const createBioSchema = insertBioSchema.omit({
	id: true,
	workspaceId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const updateBioSchema = insertBioSchema.partial().required({ id: true }).omit({
	workspaceId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const publicBioSchema = z.object({
	handle: z.string(),
	key: z.string(),
	imgShape: z.enum(['square', 'circle', 'rounded']).nullable(),
	socialDisplay: z.boolean(),
	showLocation: z.boolean(),
	showHeader: z.boolean(),
	headerStyle: z.enum(BIO_HEADER_STYLES),
	blockShadow: z.boolean(),
	showShareButton: z.boolean(),
	showSubscribeButton: z.boolean(),
	barelyBranding: z.boolean(),
	emailCaptureEnabled: z.boolean(),
	emailCaptureIncentiveText: z.string().nullable(),
});

export type InsertBio = z.infer<typeof insertBioSchema>;
export type CreateBio = z.infer<typeof createBioSchema>;
export type UpdateBio = z.infer<typeof updateBioSchema>;
export type PublicBio = z.infer<typeof publicBioSchema>;
export type Bio = InferSelectModel<typeof Bios>;

// BioButtons
export const insertBioButtonSchema = createInsertSchema(BioButtons, {
	text: text => text.min(1, 'Button text is required'),
});

export const createBioButtonSchema = insertBioButtonSchema.omit({
	id: true,
	workspaceId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const updateBioButtonSchema = insertBioButtonSchema
	.partial()
	.required({ id: true })
	.omit({
		workspaceId: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
	});

export const reorderBioButtonsSchema = z.object({
	bioId: z.string(),
	buttonIds: z.array(z.string()),
});

export type InsertBioButton = z.infer<typeof insertBioButtonSchema>;
export type CreateBioButton = z.infer<typeof createBioButtonSchema>;
export type UpdateBioButton = z.infer<typeof updateBioButtonSchema>;
export type BioButton = InferSelectModel<typeof BioButtons>;

// Bio-to-Button relationship
export const bioButtonRelationSchema = createInsertSchema(_BioButtons_To_Bios);

export type BioButtonRelation = InferSelectModel<typeof _BioButtons_To_Bios>;

// BioBlocks (New block-based system)
export const insertBioBlockSchema = createInsertSchema(BioBlocks);

export const createBioBlockSchema = insertBioBlockSchema.omit({
	id: true,
	workspaceId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const updateBioBlockSchema = insertBioBlockSchema
	.partial()
	.required({ id: true })
	.omit({
		workspaceId: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
	})
	.extend({
		// Add the new flexible CTA fields that aren't in the base schema yet
		linkId: z.string().optional(),
		bioId: z.string().optional(),
		fmId: z.string().optional(),
	});

export const reorderBioBlocksSchema = z.object({
	bioId: z.string(),
	blockIds: z.array(z.string()),
});

// Block-specific schemas for validation
// export const markdownBlockDataSchema = z.object({
// 	markdown: z.string().max(5000, 'Markdown content must be less than 5000 characters'),
// });

export const createLinksBlockDataSchema = createInsertSchema(BioBlocks, {
	type: () => z.literal('links'),
	targetLinkId: linkId => linkId.min(1, 'Link is required').optional(),
})
	.extend({
		bioId: z.string(), // we need this to join the block to the bio
	})
	.omit({
		id: true,
		workspaceId: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
	});

export const updateLinksBlockDataSchema = createLinksBlockDataSchema.partial().extend({
	id: z.string(),
});

export const createContactFormBlockDataSchema = createInsertSchema(BioBlocks, {
	type: () => z.literal('contactForm'),
})
	.extend({
		bioId: z.string(), // we need this to join the block to the bio
	})
	.omit({
		id: true,
		workspaceId: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
	});

export const updateContactFormBlockDataSchema = createContactFormBlockDataSchema
	.partial()
	.extend({
		id: z.string(),
	});

export const createMarkdownBlockDataSchema = createInsertSchema(BioBlocks, {
	type: () => z.literal('markdown'),
	markdown: markdown =>
		markdown.max(5000, 'Markdown content must be less than 5000 characters'),
})
	.extend({
		bioId: z.string(), // we need this to join the block to the bio
	})
	.omit({
		id: true,
		workspaceId: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
	});

export const updateMarkdownBlockDataSchema = createMarkdownBlockDataSchema
	.partial()
	.extend({
		id: z.string(),
	});

export const createImageBlockDataSchema = createInsertSchema(BioBlocks, {
	type: () => z.literal('image'),
	imageFileId: imageFileId => imageFileId.min(1, 'Image file is required'),
	imageCaption: imageCaption =>
		imageCaption.max(200, 'Image caption must be less than 200 characters'),
	imageAltText: imageAltText =>
		imageAltText.max(255, 'Image alt text must be less than 255 characters'),
})
	.extend({
		bioId: z.string(), // we need this to join the block to the bio
	})
	.omit({
		id: true,
		workspaceId: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
	});

export const updateImageBlockDataSchema = createImageBlockDataSchema.partial().extend({
	id: z.string(),
});

export const createTwoPanelBlockDataSchema = createInsertSchema(BioBlocks, {
	type: () => z.literal('twoPanel'),
	title: title => title.max(255, 'Title must be less than 255 characters'),
	markdown: markdown =>
		markdown.max(1000, 'Text content must be less than 1000 characters'),
	imageFileId: imageFileId => imageFileId.min(1, 'Image file is required'),
	imageMobileSide: () => z.enum(['top', 'bottom']).default('top'),
	imageDesktopSide: () => z.enum(['left', 'right']).default('left'),
})
	.extend({
		bioId: z.string(), // we need this to join the block to the bio
	})
	.omit({
		id: true,
		workspaceId: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
	})
	.refine(
		data => {
			// If CTA text is provided, at least one link target must be set
			if (data.ctaText) {
				return !!(
					data.targetUrl ??
					data.targetLinkId ??
					data.targetBioId ??
					data.targetFmId ??
					data.targetCartFunnelId
				);
			}
			return true;
		},
		{ message: 'CTA requires a link target when CTA text is provided' },
	)
	.refine(
		data => {
			// Only one CTA target should be set
			const targets = [
				data.targetUrl,
				data.targetLinkId,
				data.targetBioId,
				data.targetFmId,
				data.targetCartFunnelId,
			].filter(Boolean);
			return targets.length <= 1;
		},
		{ message: 'Only one CTA target can be set' },
	);

export const createCartBlockDataSchema = createInsertSchema(BioBlocks, {
	type: () => z.literal('cart'),
	targetCartFunnelId: targetCartFunnelId =>
		targetCartFunnelId.min(1, 'Cart funnel is required'),
	title: title => title.max(255, 'Title must be less than 255 characters'),
	subtitle: subtitle => subtitle.max(255, 'Subtitle must be less than 255 characters'),
})
	.extend({
		bioId: z.string(), // we need this to join the block to the bio
	})
	.omit({
		id: true,
		workspaceId: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
	});

// Helper to validate block data based on type
export const validateBioBlockData = (type: string, data: unknown) => {
	switch (type) {
		case 'markdown':
			return createMarkdownBlockDataSchema.parse(data);
		case 'image':
			return createImageBlockDataSchema.parse(data);
		case 'twoPanel':
			return createTwoPanelBlockDataSchema.parse(data);
		case 'cart':
			return createCartBlockDataSchema.parse(data);
		case 'links':
		case 'contactForm':
			// These existing types don't need additional data
			return {};
		default:
			throw new Error(`Unknown block type: ${type}`);
	}
};

export type InsertBioBlock = z.infer<typeof insertBioBlockSchema>;
export type CreateBioBlock = z.infer<typeof createBioBlockSchema>;
export type UpdateBioBlock = z.infer<typeof updateBioBlockSchema>;
export type BioBlock = InferSelectModel<typeof BioBlocks>;
// export type PublicBioBlock = Omit<
// 	BioBlock,
// 	'workspaceId' | 'createdAt' | 'updatedAt' | 'deletedAt'
// >;

// BioLinks (Links within blocks)
export const insertBioLinkSchema = createInsertSchema(BioLinks, {
	text: text => text.min(1, 'Link text is required'),
});

export const createBioLinkSchema = insertBioLinkSchema.omit({
	id: true,
	workspaceId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const updateBioLinkSchema = insertBioLinkSchema
	.partial()
	.required({ id: true })
	.omit({
		workspaceId: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
	});

export const reorderBioLinksSchema = z.object({
	blockId: z.string(),
	beforeLinkId: z.string().nullable(),
	afterLinkId: z.string().nullable(),
	links: z.array(
		z.object({
			id: z.string(),
			lexoRank: z.string(),
		}),
	),
});

export const updateBioLinkImageSchema = z.object({
	linkId: z.string(),
	fileId: z.string(),
});

export const removeBioLinkImageSchema = z.object({
	linkId: z.string(),
});

export type InsertBioLink = z.infer<typeof insertBioLinkSchema>;
export type CreateBioLink = z.infer<typeof createBioLinkSchema>;
export type UpdateBioLink = z.infer<typeof updateBioLinkSchema>;
export type UpdateBioLinkImage = z.infer<typeof updateBioLinkImageSchema>;
export type RemoveBioLinkImage = z.infer<typeof removeBioLinkImageSchema>;
export type BioLink = InferSelectModel<typeof BioLinks>;

// Relationship types
export type BioBlockRelation = InferSelectModel<typeof _BioBlocks_To_Bios>;
export type BioLinkRelation = InferSelectModel<typeof _BioLinks_To_BioBlocks>;

// Complex types
export interface BioButtonWithLink extends BioButton {
	link?: {
		id: string;
		url: string;
		domain: string;
	};
	form?: {
		id: string;
		name: string;
	};
}

export interface BioLinkWithTarget extends BioLink {
	link?: {
		id: string;
		url: string;
		domain: string;
	};
	form?: {
		id: string;
		name: string;
	};
}

export interface BioBlockWithLinks extends BioBlock {
	links: (BioLinkWithTarget & { lexoRank: string })[];
}

export interface BioWithBlocks extends Bio {
	blocks: (BioBlockWithLinks & { lexoRank: string })[];
	workspace?: {
		id: string;
		name: string;
		imageUrl: string | null;
		_avatarImages?: {
			file: {
				id: string;
				s3Key: string;
				blurDataUrl: string | null;
			};
		}[];
		brandKit?: {
			id: string;
			shortBio: string | null;
			longBio: string | null;
			colorScheme: {
				colors: [string, string, string];
				mapping: {
					backgroundColor: 0 | 1 | 2;
					textColor: 0 | 1 | 2;
					buttonColor: 0 | 1 | 2;
					buttonTextColor: 0 | 1 | 2;
					buttonOutlineColor: 0 | 1 | 2;
					blockColor: 0 | 1 | 2;
					blockTextColor: 0 | 1 | 2;
					bannerColor: 0 | 1 | 2;
				};
			} | null;
			fontPreset: string;
			headingFont: string | null;
			bodyFont: string | null;
			blockStyle: string;
			blockOutline: boolean;
			themeKey: string | null;
			appearancePreset: string | null;
		};
	};
}

// Legacy - kept for migration
export interface BioWithButtons extends Bio {
	buttons: (BioButtonWithLink & { lexoRank: string })[];
	workspace?: {
		id: string;
		name: string;
		imageUrl: string | null;
		_avatarImages?: {
			file: {
				id: string;
				s3Key: string;
				blurDataUrl: string | null;
			};
		}[];
		brandKit?: {
			id: string;
			shortBio: string | null;
			longBio: string | null;
			colorScheme: {
				colors: [string, string, string];
				mapping: {
					backgroundColor: 0 | 1 | 2;
					textColor: 0 | 1 | 2;
					buttonColor: 0 | 1 | 2;
					buttonTextColor: 0 | 1 | 2;
					buttonOutlineColor: 0 | 1 | 2;
					blockColor: 0 | 1 | 2;
					blockTextColor: 0 | 1 | 2;
					bannerColor: 0 | 1 | 2;
				};
			} | null;
			fontPreset: string;
			headingFont: string | null;
			bodyFont: string | null;
			blockStyle: string;
			blockOutline: boolean;
			themeKey: string | null;
			appearancePreset: string | null;
		};
	};
}

// Query schemas
export const selectBiosSchema = z.object({
	handle: z.string().optional(),
	key: z.string().optional(),
	showArchived: z.boolean().optional(),
	workspaceId: z.string().optional(),
});

export const selectBioByHandleSchema = z.object({
	handle: z.string(),
	key: z.string().default('home'),
});

export const selectBioByIdSchema = z.object({
	id: z.string(),
});

export const biosFilterParamsSchema = selectBiosSchema.merge(commonFiltersSchema);

export const selectBiosFiltersSchema = biosFilterParamsSchema.extend({
	selection: querySelectionSchema.optional(),
});

export const selectInfiniteBiosSchema =
	selectBiosFiltersSchema.merge(infiniteQuerySchema);

// Email capture schema
export const bioEmailCaptureSchema = z.object({
	bioId: z.string(),
	email: z.email('Invalid email address'),
	marketingConsent: z.boolean().default(false),
	source: z.enum(['bio_page', 'bio_popup', 'bio_inline']).default('bio_page'),
});

export type BioEmailCapture = z.infer<typeof bioEmailCaptureSchema>;

// stat filters
export const bioStatFiltersSchema = stdWebEventPipeQueryParamsSchema.extend({
	showViews: z.boolean().optional().default(true),
	showClicks: z.boolean().optional().default(true),
	showEmailCaptures: z.boolean().optional().default(false),
});
export type BioStatFilters = z.infer<typeof bioStatFiltersSchema>;
