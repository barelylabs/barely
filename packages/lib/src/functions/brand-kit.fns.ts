import type { z } from 'zod/v4';
import { dbHttp } from '@barely/db/client';
import { BrandKits, Workspaces } from '@barely/db/sql';
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
	const brandKitResults = await dbHttp
		.select({
			// BrandKit fields
			id: BrandKits.id,
			workspaceId: BrandKits.workspaceId,
			handle: BrandKits.handle,
			themeCategory: BrandKits.themeCategory,
			colorPreset: BrandKits.colorPreset,
			colorScheme: BrandKits.colorScheme,
			fontPreset: BrandKits.fontPreset,
			headingFont: BrandKits.headingFont,
			bodyFont: BrandKits.bodyFont,
			blockStyle: BrandKits.blockStyle,
			blockShadow: BrandKits.blockShadow,
			blockOutline: BrandKits.blockOutline,
			avatarS3Key: BrandKits.avatarS3Key,
			avatarBlurDataUrl: BrandKits.avatarBlurDataUrl,
			headerS3Key: BrandKits.headerS3Key,
			headerBlurDataUrl: BrandKits.headerBlurDataUrl,
			shortBio: BrandKits.shortBio,
			longBio: BrandKits.longBio,
			location: BrandKits.location,
			color1: BrandKits.color1,
			color2: BrandKits.color2,
			color3: BrandKits.color3,
			bioColorScheme: BrandKits.bioColorScheme,
			cartColorScheme: BrandKits.cartColorScheme,
			createdAt: BrandKits.createdAt,
			updatedAt: BrandKits.updatedAt,
			// Workspace fields
			workspaceName: Workspaces.name,
			workspaceHandle: Workspaces.handle,
		})
		.from(BrandKits)
		.leftJoin(Workspaces, eq(Workspaces.id, BrandKits.workspaceId))
		.where(eq(BrandKits.handle, handle))
		.limit(1)
		.$withCache();

	const brandKit = brandKitResults[0];

	if (!brandKit) {
		return null;
	}

	// Transform to match expected nested structure
	const { workspaceName, workspaceHandle, ...brandKitData } = brandKit;

	if (!workspaceName || !workspaceHandle) {
		return null;
	}
	return {
		...brandKitData,
		workspace:
			workspaceName && workspaceHandle ?
				{
					name: workspaceName,
					handle: workspaceHandle,
				}
			:	undefined,
	};
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
