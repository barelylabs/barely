import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: {
		default: 'Wiki | Barely NYC',
		template: '%s | Barely NYC Wiki',
	},
	description:
		'Resources and guides for independent artists working with Barely NYC.',
};

export default function WikiLayout({ children }: { children: React.ReactNode }) {
	return <div className='min-h-screen bg-black'>{children}</div>;
}
