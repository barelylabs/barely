import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Share Your Story - Barely NYC',
	description: "Help other artists see what's possible",
	robots: {
		index: false,
		follow: false,
	},
};

export default function TestimonialsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
