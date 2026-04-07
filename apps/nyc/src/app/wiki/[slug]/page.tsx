import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@barely/ui/icon';
import { H } from '@barely/ui/typography';

import { BlogMDX } from '../../../components/blog/blog-mdx';
import { AnimatedSection } from '../../../components/marketing/animated-section';
import { getAllWikiPages, getWikiPageBySlug } from '../../../lib/wiki';

export function generateStaticParams() {
	const pages = getAllWikiPages();
	return pages.map(page => ({
		slug: page.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const page = getWikiPageBySlug(slug);

	if (!page) {
		return {
			title: 'Page Not Found',
		};
	}

	return {
		title: page.title,
		description: page.description,
	};
}

export default async function WikiDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const page = getWikiPageBySlug(slug);

	if (!page) {
		notFound();
	}

	const formattedDate = new Date(page.lastUpdated).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	return (
		<main className='pt-16'>
			{/* Back to Wiki */}
			<section className='px-4 py-6 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<Link
						href='/wiki'
						className='inline-flex items-center text-white/60 transition-colors hover:text-white'
					>
						<Icon.chevronLeft className='mr-1 h-4 w-4' />
						Back to Wiki
					</Link>
				</div>
			</section>

			{/* Page Header */}
			<section className='px-4 py-6 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<div className='mb-12'>
							<H size='1' className='mb-4 font-heading text-4xl md:text-5xl lg:text-6xl'>
								{page.title}
							</H>
							{page.description && (
								<p className='mb-4 text-lg text-white/70'>{page.description}</p>
							)}
							<div className='flex items-center gap-3 text-sm text-white/40'>
								<span className='rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-0.5 text-purple-300'>
									{page.category}
								</span>
								<span>Last updated {formattedDate}</span>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* Page Content */}
			<section className='px-4 pb-24 pt-0 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<BlogMDX markdown={page.content} />
				</div>
			</section>
		</main>
	);
}
