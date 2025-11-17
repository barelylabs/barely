import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@barely/ui/icon';
import { Img } from '@barely/ui/img';
import { H } from '@barely/ui/typography';

import { BlogMDX } from '../../../components/blog/blog-mdx';
import { AnimatedSection } from '../../../components/marketing/animated-section';
import { MarketingButton } from '../../../components/marketing/button';
import { getAllPosts, getPostBySlug } from '../../../lib/blog';

export function generateStaticParams() {
	const posts = getAllPosts();
	return posts.map(post => ({
		slug: post.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = getPostBySlug(slug);

	if (!post) {
		return {
			title: 'Post Not Found',
		};
	}

	return {
		title: post.title,
		description: post.excerpt,
	};
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	return (
		<main className='pt-16'>
			{/* Back to Blog */}
			<section className='px-4 py-6 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<Link
						href='/blog'
						className='inline-flex items-center text-white/60 transition-colors hover:text-white'
					>
						<Icon.chevronLeft className='mr-1 h-4 w-4' />
						Back to Blog
					</Link>
				</div>
			</section>

			{/* Post Header */}
			<section className='px-4 py-6 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<div className='mb-12 text-center'>
							<H size='1' className='mb-6 font-heading text-4xl md:text-5xl lg:text-6xl'>
								{post.title}
							</H>

							<div className='mb-8 flex items-center justify-center gap-3 text-white/60'>
								<div className='flex items-center gap-2'>
									<div className='relative h-6 w-6 overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20'>
										{post.authorAvatar ?
											<Img
												src={post.authorAvatar}
												alt={post.author}
												width={24}
												height={24}
												className='h-full w-full object-cover'
											/>
										:	<div className='flex h-full w-full items-center justify-center text-sm font-bold text-white/60'>
												{post.author.charAt(0).toUpperCase()}
											</div>
										}
									</div>
									<span>{post.author}</span>
								</div>
								<span>•</span>
								<time dateTime={post.date}>{formattedDate}</time>
							</div>

							{post.tags.length > 0 && (
								<div className='flex flex-wrap justify-center gap-2'>
									{post.tags.map(tag => (
										<span
											key={tag}
											className='rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-sm text-purple-300'
										>
											{tag}
										</span>
									))}
								</div>
							)}
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* Post Content */}
			<section className='px-4 pb-12 pt-0 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<BlogMDX markdown={post.content} />
				</div>
			</section>

			{/* CTA Section */}
			<section className='bg-white/5 px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='3' className='mb-4'>
							Ready to Apply These Strategies?
						</H>
						<p className='mb-8 text-white/70'>
							Get personalized guidance for your music marketing journey.
						</p>
						<div className='flex flex-col justify-center gap-4 sm:flex-row'>
							<Link href='/services'>
								<MarketingButton marketingLook='hero-primary'>
									Explore Our Services
								</MarketingButton>
							</Link>
							<a
								href='https://cal.com/barely/nyc'
								target='_blank'
								rel='noopener noreferrer'
							>
								<MarketingButton marketingLook='scientific'>
									Book Free Strategy Call
								</MarketingButton>
							</a>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
