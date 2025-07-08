export const MDX_IMAGE_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export const MDX_IMAGE_SIZE_TO_WIDTH = {
	xs: 288,
	sm: 384,
	md: 448,
	lg: 512,
	xl: 576,
} as const;

export type MdxImageSize = (typeof MDX_IMAGE_SIZES)[number];
