import '@testing-library/react';

import React from 'react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { beforeAll, expect, vi } from 'vitest';

// Set up test environment variables before any tests run
beforeAll(() => {
	// Skip environment validation in tests
	// eslint-disable-next-line no-restricted-properties
	process.env.SKIP_ENV_VALIDATION = 'true';

	// Set up global fetch mock
	global.fetch = vi.fn();

	// Polyfill for happy-dom missing DOM APIs required by @radix-ui
	HTMLElement.prototype.hasPointerCapture = () => false;
	HTMLElement.prototype.setPointerCapture = () => {
		/* noop */
	};
	HTMLElement.prototype.releasePointerCapture = () => {
		/* noop */
	};
});

expect.extend(matchers);

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		refresh: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
	}),
	usePathname: () => '/',
	useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link
vi.mock('next/link', () => ({
	default: ({
		children,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) => (
		<a {...props}>{children}</a>
	),
}));

// Mock next/image
vi.mock('next/image', () => ({
	default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={src} alt={alt} {...props} />
	),
}));
