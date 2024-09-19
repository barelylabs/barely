import { z } from 'zod';

import { queryBooleanSchema } from '../../utils/zod-helpers';
import { MDX_IMAGE_SIZES } from './mdx.constants';

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

export const mdxImageFileSchema = z.object({
	file: z.object({
		id: z.string().min(1, 'Asset ID is required'),
		name: z.string().min(1, 'Asset name is required'),
		s3Key: z.string().min(1, 'S3 key is required'),
		src: z.string().optional(),
		width: z.coerce.number().optional(),
		height: z.coerce.number().optional(),
		blurDataUrl: z.string().optional(),
	}),

	alt: z.string(),
	size: z.enum(MDX_IMAGE_SIZES).optional(),
});

export const mdxGridSchema = z.object({
	reverseOnMobile: queryBooleanSchema,
	growColumn: z.enum(['left', 'right', 'none']).optional(),
});
