import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@barely/ui/icon';
import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../../components/marketing/animated-section';
import { MarketingButton } from '../../../components/marketing/button';
import { CaseStudyCard } from '../../../components/marketing/case-study-card';
import { GoalsButton } from './goals-button';

export const metadata: Metadata = {
	title: 'Submission Received | @barely.indie Playlist',
	description: "Thanks for submitting! We'll review your track within 1-2 weeks.",
};

export default function ThankYouPage() {
	return (
		<main className='pt-16'>
			{/* Success Message */}
			<section className='px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
				<div className='mx-auto max-w-3xl text-center'>
					<AnimatedSection animation='scale'>
						<div className='mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20'>
							<Icon.check className='h-12 w-12 text-green-500' />
						</div>
						<H size='1' className='mb-4 font-heading text-4xl md:text-5xl lg:text-6xl'>
							Submission Received!
						</H>
						<p className='text-lg text-white/70 md:text-xl'>
							We'll review your track within 1-2 weeks and email you with our decision.
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Next Steps */}
			<section className='px-4 pb-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-3xl'>
					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass rounded-xl p-6 sm:p-8'>
							<H size='3' className='mb-6 text-2xl'>
								While You Wait...
							</H>
							<div className='space-y-4'>
								<div className='flex gap-4'>
									<div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20'>
										<Icon.instagram className='h-4 w-4 text-blue-400' />
									</div>
									<div>
										<h3 className='mb-1 font-semibold text-white'>
											Follow @barely.indie
										</h3>
										<p className='text-sm text-white/60'>
											Stay updated on new playlist additions and indie music community
										</p>
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20'>
										<Icon.spotify className='h-4 w-4 text-green-400' />
									</div>
									<div>
										<h3 className='mb-1 font-semibold text-white'>Follow the Playlist</h3>
										<p className='text-sm text-white/60'>
											Get notified when your track is added (and discover new artists)
										</p>
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20'>
										<Icon.email className='h-4 w-4 text-purple-400' />
									</div>
									<div>
										<h3 className='mb-1 font-semibold text-white'>Check your email</h3>
										<p className='text-sm text-white/60'>
											Confirmation sent to your inbox (check spam if you don't see it)
										</p>
									</div>
								</div>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* Case Studies Section */}
			<section className='bg-white/5 px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<div className='mb-12 text-center'>
							<H size='2' className='mb-4 text-3xl md:text-4xl'>
								How Artists Grow With Barely NYC
							</H>
							<p className='text-lg text-white/70'>
								Real results from indie artists who partnered with us
							</p>
						</div>
					</AnimatedSection>

					<div className='grid gap-8 md:grid-cols-2'>
						{/* Case Study 1: Proper Youth */}
						<AnimatedSection animation='fade-up' delay={200}>
							<CaseStudyCard
								artistName='Proper Youth'
								genre='Alt Rock • Brooklyn'
								serviceTier='Rising Artist'
								beforeListeners={100}
								afterListeners={15000}
								growthPercentage={14900}
								timeframe='18 months'
								summary='Started with 100 monthly listeners. Now generates consistent revenue through merch, tickets, and streams.'
								merchRevenue={{ before: 0, after: 3500 }}
							/>
						</AnimatedSection>

						{/* Case Study 2: The Now */}
						<AnimatedSection animation='fade-up' delay={400}>
							<CaseStudyCard
								artistName='The Now'
								genre='Indie Rock • Cleveland'
								serviceTier='Breakout Artist'
								beforeListeners={3000}
								afterListeners={20000}
								growthPercentage={567}
								timeframe='9 months'
								summary='Scaled from regional following to national reach through data-driven campaigns.'
							/>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-3xl'>
					<AnimatedSection animation='scale' delay={600}>
						<div className='glass rounded-xl p-8 text-center'>
							<H size='2' className='mb-4 text-3xl md:text-4xl'>
								Ready to Grow Like This?
							</H>
							<p className='mb-8 text-lg text-white/70'>
								We help indie artists scale from hundreds to thousands of monthly
								listeners using transparent, data-driven campaigns.
							</p>
							<div className='flex flex-col justify-center gap-4 sm:flex-row'>
								<GoalsButton />
								<Link href='/case-studies'>
									<MarketingButton
										marketingLook='scientific'
										size='lg'
										className='min-w-[200px]'
									>
										See All Case Studies
									</MarketingButton>
								</Link>
							</div>
							<p className='mt-6 text-sm text-white/50'>
								No obligation • Free consultation • Honest timeline
							</p>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
