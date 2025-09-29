import { BrandKits } from '@barely/db/sql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getBrandKit, getValidatedCartBrandKit } from '../brand-kit.fns';

// Mock the database client
const mockSelect = vi.fn();
vi.mock('@barely/db/client', () => ({
	dbHttp: {
		select: () => mockSelect() as unknown,
	},
}));

describe('brand-kit.fns', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('getBrandKit', () => {
		it('should fetch brand kit from database with caching', async () => {
			const mockBrandKit = {
				id: 'bk_123',
				workspaceId: 'ws_123',
				handle: 'test-handle',
				themeCategory: 'vibrant',
				colorPreset: 'sunset',
				colorScheme: {
					colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
					mapping: {
						backgroundColor: 1,
						textColor: 0,
						buttonColor: 2,
						buttonTextColor: 1,
						buttonOutlineColor: 0,
						blockColor: 1,
						blockTextColor: 0,
						bannerColor: 2,
					},
				},
				fontPreset: 'modern.montserrat',
				headingFont: 'Montserrat',
				bodyFont: 'Inter',
				blockStyle: 'rounded',
				blockShadow: true,
				blockOutline: false,
				avatarS3Key: 'avatar.jpg',
				avatarBlurDataUrl: 'data:image/jpeg;base64,blur',
				headerS3Key: null,
				headerBlurDataUrl: null,
			};

			const mockSelectBuilder = {
				from: vi.fn(),
				leftJoin: vi.fn(),
				where: vi.fn(),
				limit: vi.fn(),
				$withCache: vi.fn().mockResolvedValue([
					{
						...mockBrandKit,
						workspaceName: 'Test Workspace',
						workspaceHandle: 'test-workspace',
					},
				]),
			};

			mockSelectBuilder.from.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.leftJoin.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.where.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.limit.mockReturnValue(mockSelectBuilder);

			mockSelect.mockReturnValue(mockSelectBuilder);

			const result = await getBrandKit({ handle: 'test-handle' });

			expect(mockSelect).toHaveBeenCalledTimes(1);
			expect(mockSelectBuilder.from).toHaveBeenCalledWith(BrandKits);
			expect(mockSelectBuilder.leftJoin).toHaveBeenCalled();
			expect(mockSelectBuilder.limit).toHaveBeenCalledWith(1);
			expect(mockSelectBuilder.$withCache).toHaveBeenCalled();
			expect(result).toEqual({
				...mockBrandKit,
				workspace: {
					name: 'Test Workspace',
					handle: 'test-workspace',
				},
			});
		});

		it('should return null when brand kit not found', async () => {
			const mockSelectBuilder = {
				from: vi.fn(),
				leftJoin: vi.fn(),
				where: vi.fn(),
				limit: vi.fn(),
				$withCache: vi.fn().mockResolvedValue([]),
			};

			mockSelectBuilder.from.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.leftJoin.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.where.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.limit.mockReturnValue(mockSelectBuilder);

			mockSelect.mockReturnValue(mockSelectBuilder);

			const result = await getBrandKit({ handle: 'nonexistent' });

			expect(result).toBeNull();
		});

		it('should handle database errors gracefully', async () => {
			const mockSelectBuilder = {
				from: vi.fn(),
				leftJoin: vi.fn(),
				where: vi.fn(),
				limit: vi.fn(),
				$withCache: vi.fn().mockRejectedValue(new Error('Database error')),
			};

			mockSelectBuilder.from.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.leftJoin.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.where.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.limit.mockReturnValue(mockSelectBuilder);

			mockSelect.mockReturnValue(mockSelectBuilder);

			await expect(getBrandKit({ handle: 'test-handle' })).rejects.toThrow(
				'Database error',
			);
		});
	});

	describe('getValidatedCartBrandKit', () => {
		it('should validate and return cart-specific brand kit fields', async () => {
			const mockBrandKit = {
				id: 'bk_123',
				workspaceId: 'ws_123',
				handle: 'test-handle',
				themeCategory: 'vibrant',
				colorPreset: 'sunset',
				colorScheme: {
					colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
					mapping: {
						backgroundColor: 1,
						textColor: 0,
						buttonColor: 2,
						buttonTextColor: 1,
						buttonOutlineColor: 0,
						blockColor: 1,
						blockTextColor: 0,
						bannerColor: 2,
					},
				},
				fontPreset: 'modern.montserrat',
				headingFont: 'Montserrat',
				bodyFont: 'Inter',
				blockStyle: 'rounded',
				blockShadow: true,
				blockOutline: false,
				avatarS3Key: 'avatar.jpg',
				avatarBlurDataUrl: 'data:image/jpeg;base64,blur',
				headerS3Key: null,
				headerBlurDataUrl: null,
				// Extra fields that should be filtered out
				createdAt: new Date(),
				updatedAt: new Date(),
				archivedAt: null,
				deletedAt: null,
				shortBio: 'Test bio',
				longBio: 'Longer test bio',
				location: 'Test Location',
			};

			const mockSelectBuilder = {
				from: vi.fn(),
				leftJoin: vi.fn(),
				where: vi.fn(),
				limit: vi.fn(),
				$withCache: vi.fn().mockResolvedValue([mockBrandKit]),
			};

			mockSelectBuilder.from.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.leftJoin.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.where.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.limit.mockReturnValue(mockSelectBuilder);

			mockSelect.mockReturnValue(mockSelectBuilder);

			const result = await getValidatedCartBrandKit({ handle: 'test-handle' });

			expect(result).toBeDefined();
			expect(result?.handle).toBe('test-handle');
			expect(result?.themeCategory).toBe('vibrant');
			expect(result?.colorScheme.colors).toEqual(['#FF6B6B', '#4ECDC4', '#45B7D1']);
			// Verify extra fields are not included
			const resultWithExtraFields = result as unknown as {
				createdAt?: Date;
				shortBio?: string;
			};
			expect(resultWithExtraFields.createdAt).toBeUndefined();
			expect(resultWithExtraFields.shortBio).toBeUndefined();
		});

		it('should return null when brand kit not found', async () => {
			const mockSelectBuilder = {
				from: vi.fn(),
				leftJoin: vi.fn(),
				where: vi.fn(),
				limit: vi.fn(),
				$withCache: vi.fn().mockResolvedValue([]),
			};

			mockSelectBuilder.from.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.leftJoin.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.where.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.limit.mockReturnValue(mockSelectBuilder);

			mockSelect.mockReturnValue(mockSelectBuilder);

			const result = await getValidatedCartBrandKit({ handle: 'nonexistent' });

			expect(result).toBeNull();
		});

		it('should return default values when validation fails', async () => {
			const invalidBrandKit = {
				id: 'bk_123',
				workspaceId: 'ws_123',
				handle: 'test-handle',
				// Invalid color scheme structure
				colorScheme: {
					colors: ['invalid'], // Should be a tuple of 3 strings
					mapping: {
						backgroundColor: 5, // Invalid value (should be 0, 1, or 2)
					},
				},
			};

			const mockSelectBuilder = {
				from: vi.fn(),
				leftJoin: vi.fn(),
				where: vi.fn(),
				limit: vi.fn(),
				$withCache: vi.fn().mockResolvedValue([invalidBrandKit]),
			};

			mockSelectBuilder.from.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.leftJoin.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.where.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.limit.mockReturnValue(mockSelectBuilder);

			mockSelect.mockReturnValue(mockSelectBuilder);

			// Spy on console.error to verify error logging
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
				return undefined;
			});

			const result = await getValidatedCartBrandKit({ handle: 'test-handle' });

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'BrandKit validation failed for handle:',
				'test-handle',
				expect.any(Error),
			);

			expect(result).toBeDefined();
			expect(result?.handle).toBe('test-handle');
			// Should have default values
			expect(result?.themeCategory).toBe('custom');
			expect(result?.colorPreset).toBe('default');
			expect(result?.colorScheme.colors).toEqual(['#000000', '#ffffff', '#808080']);
			expect(result?.fontPreset).toBe('modern.cal');
			expect(result?.blockStyle).toBe('rounded');

			consoleErrorSpy.mockRestore();
		});

		it('should handle partial data with defaults', async () => {
			const partialBrandKit = {
				id: 'bk_123',
				workspaceId: 'ws_123',
				handle: 'test-handle',
				themeCategory: 'bold',
				// Missing required fields that should cause validation to fail
				colorPreset: undefined,
				colorScheme: undefined,
			};

			const mockSelectBuilder = {
				from: vi.fn(),
				leftJoin: vi.fn(),
				where: vi.fn(),
				limit: vi.fn(),
				$withCache: vi.fn().mockResolvedValue([partialBrandKit]),
			};

			mockSelectBuilder.from.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.leftJoin.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.where.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.limit.mockReturnValue(mockSelectBuilder);

			mockSelect.mockReturnValue(mockSelectBuilder);

			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
				return undefined;
			});

			const result = await getValidatedCartBrandKit({ handle: 'test-handle' });

			expect(result).toBeDefined();
			expect(result?.handle).toBe('test-handle');
			// Should fallback to defaults
			expect(result?.colorScheme).toBeDefined();
			expect(result?.colorPreset).toBe('default');

			consoleErrorSpy.mockRestore();
		});
	});

	describe('cache behavior', () => {
		it('should use $withCache for query optimization', async () => {
			const mockSelectBuilder = {
				from: vi.fn(),
				leftJoin: vi.fn(),
				where: vi.fn(),
				limit: vi.fn(),
				$withCache: vi.fn().mockResolvedValue([]),
			};

			mockSelectBuilder.from.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.leftJoin.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.where.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.limit.mockReturnValue(mockSelectBuilder);

			mockSelect.mockReturnValue(mockSelectBuilder);

			await getBrandKit({ handle: 'test-handle' });

			// Verify that $withCache was called (not a regular query)
			expect(mockSelectBuilder.$withCache).toHaveBeenCalledTimes(1);
		});

		it('should handle cache miss and still return data', async () => {
			const mockBrandKit = {
				id: 'bk_123',
				workspaceId: 'ws_123',
				handle: 'test-handle',
				themeCategory: 'classic',
				colorPreset: 'monochrome',
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
				fontPreset: 'classic.playfairDisplay',
				headingFont: 'Playfair Display',
				bodyFont: 'Inter',
				blockStyle: 'square',
				blockShadow: false,
				blockOutline: true,
				avatarS3Key: null,
				avatarBlurDataUrl: null,
				headerS3Key: null,
				headerBlurDataUrl: null,
			};

			const mockSelectBuilder = {
				from: vi.fn(),
				leftJoin: vi.fn(),
				where: vi.fn(),
				limit: vi.fn(),
				// Simulate cache miss but still returning data from DB
				$withCache: vi.fn().mockResolvedValue([mockBrandKit]),
			};

			mockSelectBuilder.from.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.leftJoin.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.where.mockReturnValue(mockSelectBuilder);
			mockSelectBuilder.limit.mockReturnValue(mockSelectBuilder);

			mockSelect.mockReturnValue(mockSelectBuilder);

			const result = await getBrandKit({ handle: 'test-handle' });

			expect(result).toEqual(mockBrandKit);
		});
	});
});
