import { z } from 'zod';

export const mdxVideoSchema = z.object({
	url: z.string(),
});

export const mdxLinkButtonSchema = z.object({
	href: z.string(),
	label: z.string().optional(),
});

export const mdxAssetButtonSchema = z.object({
	asset: z.object({
		id: z.string().min(1, 'Asset ID is required'),
		name: z.string().min(1, 'Asset name is required'),
		type: z.string().min(1, 'Asset type is required'),
	}),
	label: z.string().optional(),
});
