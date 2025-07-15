import '@testing-library/react';

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
	default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

// Mock next/image
vi.mock('next/image', () => ({
	default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));