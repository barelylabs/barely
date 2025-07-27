import { H } from '@barely/ui/typography';

import { BlogCard } from '../../components/blog/blog-card';
import { AnimatedSection } from '../../components/marketing/animated-section';
import { getAllPosts } from '../../lib/blog';

export default function BlogPage() {
	const posts = getAllPosts();

	return (
		<main className='pt-16'>
			{/* Page Header */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='1' className='mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'>
							Music Marketing Insights
						</H>
						<p className='text-xl text-white/70 md:text-2xl'>
							Data-driven strategies for independent artists navigating the modern music
							industry
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Blog Posts */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					{posts.length === 0 ?
						<AnimatedSection animation='fade-up'>
							<div className='py-12 text-center'>
								<p className='text-white/60'>No blog posts yet. Check back soon!</p>
							</div>
						</AnimatedSection>
					:	<div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
							{posts.map((post, index) => (
								<AnimatedSection key={post.slug} animation='fade-up' delay={index * 100}>
									<BlogCard post={post} />
								</AnimatedSection>
							))}
						</div>
					}
				</div>
			</section>
		</main>
	);
}
