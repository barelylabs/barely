import Link from 'next/link';

import { Icon } from '@barely/ui/icon';
import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../components/marketing/animated-section';
import { getWikiPagesByCategory } from '../../lib/wiki';

export default function WikiPage() {
	const categories = getWikiPagesByCategory();
	const categoryNames = Object.keys(categories).sort();
	const totalPages = Object.values(categories).flat().length;

	return (
		<main className='pt-16'>
			{/* Page Header */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='1' className='mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'>
							Wiki
						</H>
						<p className='text-xl text-white/70 md:text-2xl'>
							Resources, guides, and knowledge base for independent artists
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Wiki Pages */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					{totalPages === 0 ?
						<AnimatedSection animation='fade-up'>
							<div className='py-12 text-center'>
								<p className='text-white/60'>No wiki pages yet. Check back soon!</p>
							</div>
						</AnimatedSection>
					:	<div className='space-y-12'>
							{categoryNames.map((category, categoryIndex) => {
								const pages = categories[category];
								if (!pages) return null;

								return (
									<AnimatedSection
										key={category}
										animation='fade-up'
										delay={categoryIndex * 100}
									>
										<div>
											<h2 className='mb-4 text-lg font-semibold uppercase tracking-wider text-white/50'>
												{category}
											</h2>
											<div className='space-y-2'>
												{pages.map(page => (
													<Link
														key={page.slug}
														href={`/wiki/${page.slug}`}
														className='group flex items-center justify-between rounded-lg border border-white/10 px-5 py-4 transition-all hover:border-purple-500/30 hover:bg-white/5'
													>
														<div className='min-w-0 flex-1'>
															<h3 className='text-lg font-medium text-white group-hover:text-purple-300'>
																{page.title}
															</h3>
															{page.description && (
																<p className='mt-1 truncate text-sm text-white/50'>
																	{page.description}
																</p>
															)}
														</div>
														<Icon.chevronRight className='ml-4 h-5 w-5 flex-shrink-0 text-white/30 transition-colors group-hover:text-purple-400' />
													</Link>
												))}
											</div>
										</div>
									</AnimatedSection>
								);
							})}
						</div>
					}
				</div>
			</section>
		</main>
	);
}
