import type { InferSelectModel } from 'drizzle-orm';
import { _BioButtons_To_Bios, BioButtons, Bios } from '@barely/db/sql';
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
	title: title => title.min(1, 'Title must be at least 1 character'),
	subtitle: subtitle => subtitle.min(1, 'Subtitle must be at least 1 character'),
}).extend({
	emailCaptureEnabled: z.boolean().default(false),
	emailCaptureIncentiveText: z.string().optional(),
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
	route: z.string().nullable(),
	slug: z.string().nullable(),
	img: z.string().nullable(),
	imgShape: z.enum(['square', 'circle', 'rounded']).nullable(),
	title: z.string().nullable(),
	subtitle: z.string().nullable(),
	titleColor: z.string().nullable(),
	buttonColor: z.string().nullable(),
	iconColor: z.string().nullable(),
	textColor: z.string().nullable(),
	socialDisplay: z.boolean(),
	socialButtonColor: z.string().nullable(),
	socialIconColor: z.string().nullable(),
	theme: z.enum(['light', 'dark', 'app']),
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

export interface BioWithButtons extends Bio {
	buttons: (BioButtonWithLink & { lexoRank: string })[];
	workspace?: {
		id: string;
		name: string;
		imageUrl: string | null;
	};
}

// Query schemas
export const selectBiosSchema = z.object({
	handle: z.string().optional(),
	showArchived: z.boolean().optional(),
	workspaceId: z.string().optional(),
});

export const selectBioByHandleSchema = z.object({
	handle: z.string(),
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
