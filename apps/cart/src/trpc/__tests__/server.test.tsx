import { cache } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchBrandKitByHandle } from '../server';

// Mock the cartRouter and its methods
const mockCartRouter = {
	createCaller: vi.fn(() => ({
		brandKitByHandle: vi.fn(),
	})),
};

vi.mock('@barely/api/public/cart.router', () => ({
	cartRouter: mockCartRouter,
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
	headers: vi.fn(() => new Headers()),
}));

// Mock the createTRPCContext
vi.mock('@barely/lib/trpc', () => ({
	createTRPCContext: vi.fn(() => ({
		auth: null,
		pool: null,
		visitor: null,
	})),
}));

// Mock React cache
vi.mock('react', () => ({
	cache: vi.fn(<T extends (...args: Parameters<T>) => ReturnType<T>>(fn: T) => fn), // Type-safe pass-through for testing
}));

describe('cart server.tsx', () => {
	let mockBrandKitByHandle: ReturnType<typeof vi.fn>;
	let mockCreateCaller: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockBrandKitByHandle = vi.fn();
		mockCreateCaller = vi.fn(() => ({
			brandKitByHandle: mockBrandKitByHandle,
		}));

		// Update the mock directly
		mockCartRouter.createCaller = mockCreateCaller;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('fetchBrandKitByHandle', () => {
		it('should fetch brand kit for a given handle', async () => {
			const mockBrandKit = {
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
				avatarS3Key: null,
				avatarBlurDataUrl: null,
				headerS3Key: null,
				headerBlurDataUrl: null,
			};

			mockBrandKitByHandle.mockResolvedValue(mockBrandKit);

			const result = await fetchBrandKitByHandle('test-handle');

			expect(mockBrandKitByHandle).toHaveBeenCalledWith({ handle: 'test-handle' });
			expect(result).toEqual(mockBrandKit);
		});

		it('should handle errors from the tRPC caller', async () => {
			const error = new Error('Brand kit not found');
			mockBrandKitByHandle.mockRejectedValue(error);

			await expect(fetchBrandKitByHandle('nonexistent')).rejects.toThrow(
				'Brand kit not found',
			);

			expect(mockBrandKitByHandle).toHaveBeenCalledWith({ handle: 'nonexistent' });
		});

		it('should be wrapped with React cache for request deduplication', () => {
			// Verify that the cache function is called
			expect(cache).toHaveBeenCalled();
		});

		it('should return consistent data for same handle', async () => {
			const mockBrandKit = {
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
				avatarS3Key: 'avatar.jpg',
				avatarBlurDataUrl: 'data:image/jpeg;base64,blur',
				headerS3Key: null,
				headerBlurDataUrl: null,
			};

			mockBrandKitByHandle.mockResolvedValue(mockBrandKit);

			const result1 = await fetchBrandKitByHandle('test-handle');
			const result2 = await fetchBrandKitByHandle('test-handle');

			expect(result1).toEqual(mockBrandKit);
			expect(result2).toEqual(mockBrandKit);
			// Both calls should return the same data
			expect(result1).toBe(result2);
		});

		it('should handle null response from tRPC', async () => {
			mockBrandKitByHandle.mockResolvedValue(null);

			const result = await fetchBrandKitByHandle('test-handle');

			expect(result).toBeNull();
			expect(mockBrandKitByHandle).toHaveBeenCalledWith({ handle: 'test-handle' });
		});
	});
});
