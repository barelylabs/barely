import type { z } from 'zod/v4';
import { dbHttp } from '@barely/db/client';
import { BrandKits } from '@barely/db/sql';
import { selectBrandKitSchema } from '@barely/validators/schemas';
import { eq } from 'drizzle-orm';

// Cart-specific BrandKit subset schema for validation
const cartBrandKitSchema = selectBrandKitSchema.pick({
	workspaceId: true,
	handle: true,
	themeCategory: true,
	colorPreset: true,
	colorScheme: true,
	fontPreset: true,
	headingFont: true,
	bodyFont: true,
	blockStyle: true,
	blockShadow: true,
	blockOutline: true,
	avatarS3Key: true,
	avatarBlurDataUrl: true,
	headerS3Key: true,
	headerBlurDataUrl: true,
});

export type CartBrandKit = z.infer<typeof cartBrandKitSchema>;

// Default values for cart BrandKit when validation fails
const defaultCartBrandKit: CartBrandKit = {
	workspaceId: '',
	handle: '',
	themeCategory: 'custom',
	colorPreset: 'default',
	colorScheme: {
		colors: ['#000000', '#ffffff', '#808080'],
		mapping: {
			backgroundColor: 1,
			textColor: 0,
			buttonColor: 0,
			buttonTextColor: 1,
			buttonOutlineColor: 0,
			blockColor: 1,
			blockTextColor: 0,
			bannerColor: 0,
		},
	},
	fontPreset: 'modern.cal',
	headingFont: 'Cal Sans',
	bodyFont: 'Inter',
	blockStyle: 'rounded',
	blockShadow: false,
	blockOutline: false,
	avatarS3Key: null,
	avatarBlurDataUrl: null,
	headerS3Key: null,
	headerBlurDataUrl: null,
};

export async function getBrandKit({ handle }: { handle: string }) {
	const [brandKit] = await dbHttp
		.select()
		.from(BrandKits)
		.where(eq(BrandKits.handle, handle))
		.limit(1)
		.$withCache();

	return brandKit ?? null;
}

export async function getValidatedCartBrandKit({
	handle,
}: {
	handle: string;
}): Promise<CartBrandKit | null> {
	try {
		const brandKit = await getBrandKit({ handle });

		if (!brandKit) {
			return null;
		}

		// Validate and return only the cart-relevant fields
		const validated = cartBrandKitSchema.parse(brandKit);
		return validated;
	} catch (error) {
		console.error('BrandKit validation failed for handle:', handle, error);
		// Return default values with the handle to maintain consistency
		return {
			...defaultCartBrandKit,
			handle,
		};
	}
}
