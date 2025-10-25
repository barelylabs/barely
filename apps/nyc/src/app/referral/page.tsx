import type { Metadata } from 'next';
import { NYC_BEDROOM_PLUS, NYC_BREAKOUT_PLUS, NYC_RISING_PLUS } from '@barely/const';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '~/components/marketing/animated-section';

export const metadata: Metadata = {
	title: 'Referral Program - Barely NYC',
	description: 'Help fellow artists grow and get rewarded',
	robots: {
		index: false,
		follow: false,
	},
};

export default function ReferralPage() {
	return (
		<main className='pt-16'>
			{/* Hero Section */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='1' className='mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'>
							Help Your Fellow Artists Grow
						</H>
						<p className='text-xl text-white/70 md:text-2xl'>
							When you introduce us to an artist who becomes a client, you both win
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* How It Works */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							How It Works
						</H>
					</AnimatedSection>

					<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
						<AnimatedSection animation='fade-up' delay={200}>
							<div className='glass flex h-full flex-col rounded-xl p-8 text-center'>
								<div className='mb-4 flex justify-center'>
									<div className='flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20'>
										<span className='text-3xl'>🤝</span>
									</div>
								</div>
								<H size='4' className='mb-3'>
									1. Introduce Us
								</H>
								<p className='text-white/70'>
									Tell us about an artist you believe in, or intro us via email/text
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<div className='glass flex h-full flex-col rounded-xl p-8 text-center'>
								<div className='mb-4 flex justify-center'>
									<div className='flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20'>
										<span className='text-3xl'>🚀</span>
									</div>
								</div>
								<H size='4' className='mb-3'>
									2. They Get Started
								</H>
								<p className='text-white/70'>
									They get 2 months at the discounted rate (vs. standard 1 month)
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<div className='glass flex h-full flex-col rounded-xl p-8 text-center'>
								<div className='mb-4 flex justify-center'>
									<div className='flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20'>
										<span className='text-3xl'>🎁</span>
									</div>
								</div>
								<H size='4' className='mb-3'>
									3. You Get Rewarded
								</H>
								<p className='text-white/70'>
									After their first payment clears, you get a credit matching their tier
								</p>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* What Your Referral Gets */}
			<section className='bg-white/5 px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							What Your Referral Gets
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass rounded-xl p-8'>
							<H size='3' className='gradient-text mb-6 text-center'>
								2 Months at First-Month Pricing
							</H>
							<p className='mb-8 text-center text-lg text-white/80'>
								Double the standard discount to give them more time to see results
							</p>

							<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
								<div className='rounded-lg bg-white/5 p-6'>
									<div className='mb-2 text-sm text-purple-300'>
										{NYC_BEDROOM_PLUS.name}
									</div>
									<div className='mb-1 text-2xl font-semibold text-white'>
										${NYC_BEDROOM_PLUS.promotionalPrice?.firstMonth}/month
									</div>
									<div className='text-sm text-white/50 line-through'>
										Regular: ${NYC_BEDROOM_PLUS.price.monthly.amount}/month
									</div>
									<div className='mt-3 text-xs text-white/60'>for 2 months</div>
								</div>

								<div className='rounded-lg bg-white/5 p-6'>
									<div className='mb-2 text-sm text-purple-300'>
										{NYC_RISING_PLUS.name}
									</div>
									<div className='mb-1 text-2xl font-semibold text-white'>
										${NYC_RISING_PLUS.promotionalPrice?.firstMonth}/month
									</div>
									<div className='text-sm text-white/50 line-through'>
										Regular: ${NYC_RISING_PLUS.price.monthly.amount}/month
									</div>
									<div className='mt-3 text-xs text-white/60'>for 2 months</div>
								</div>

								<div className='rounded-lg bg-white/5 p-6'>
									<div className='mb-2 text-sm text-purple-300'>
										{NYC_BREAKOUT_PLUS.name}
									</div>
									<div className='mb-1 text-2xl font-semibold text-white'>
										${NYC_BREAKOUT_PLUS.promotionalPrice?.firstMonth}/month
									</div>
									<div className='text-sm text-white/50 line-through'>
										Regular: ${NYC_BREAKOUT_PLUS.price.monthly.amount}/month
									</div>
									<div className='mt-3 text-xs text-white/60'>for 2 months</div>
								</div>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* What You Get */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							What You Get
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass glow-card-purple rounded-xl p-8'>
							<div className='mb-6 text-center'>
								<div className='mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-pink-600'>
									<span className='text-4xl'>✨</span>
								</div>
							</div>
							<H size='3' className='mb-4 text-center'>
								Credit Based on Who You Refer
							</H>
							<p className='mb-6 text-center text-lg text-white/80'>
								Applied to your invoice the month after their first payment clears
							</p>

							<div className='space-y-4 rounded-lg bg-white/5 p-6'>
								<div className='flex items-center justify-between'>
									<span className='text-white/70'>
										Refer a {NYC_BEDROOM_PLUS.name} artist
									</span>
									<span className='font-semibold text-purple-300'>
										${NYC_BEDROOM_PLUS.promotionalPrice?.firstMonth} credit
									</span>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-white/70'>
										Refer a {NYC_RISING_PLUS.name} artist
									</span>
									<span className='font-semibold text-purple-300'>
										${NYC_RISING_PLUS.promotionalPrice?.firstMonth} credit
									</span>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-white/70'>
										Refer a {NYC_BREAKOUT_PLUS.name} artist
									</span>
									<span className='font-semibold text-purple-300'>
										${NYC_BREAKOUT_PLUS.promotionalPrice?.firstMonth} credit
									</span>
								</div>
							</div>

							<div className='mt-8 text-center'>
								<p className='text-sm text-white/50'>
									Credits stack - refer multiple artists to build up your credit balance
								</p>
								<p className='mt-2 text-white/60'>
									Plus the satisfaction of helping fellow artists grow with transparent,
									data-driven marketing
								</p>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* How to Refer */}
			<section className='bg-white/5 px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-3xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-8 text-center text-3xl md:text-4xl'>
							How to Refer
						</H>
						<p className='mb-8 text-center text-lg text-white/80'>
							Just reach out however you normally contact us:
						</p>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass rounded-xl p-8'>
							<ul className='space-y-4 text-lg text-white/80'>
								<li className='flex items-start'>
									<span className='mr-3 text-purple-400'>•</span>
									<span>Mention it on our next call</span>
								</li>
								<li className='flex items-start'>
									<span className='mr-3 text-purple-400'>•</span>
									<span>Send a text with their info</span>
								</li>
								<li className='flex items-start'>
									<span className='mr-3 text-purple-400'>•</span>
									<span>Intro us via email</span>
								</li>
								<li className='flex items-start'>
									<span className='mr-3 text-purple-400'>•</span>
									<span>CC us when you tell them about Barely</span>
								</li>
							</ul>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* Fine Print */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-3xl'>
					<AnimatedSection animation='fade-up'>
						<div className='rounded-xl bg-white/5 p-6'>
							<H size='5' className='mb-4 text-white/70'>
								Program Details
							</H>
							<ul className='space-y-2 text-sm text-white/60'>
								<li>• Referral must become a paying client to qualify</li>
								<li>
									• Credit amount based on the tier your referral signs up for ($
									{NYC_BEDROOM_PLUS.promotionalPrice?.firstMonth}, $
									{NYC_RISING_PLUS.promotionalPrice?.firstMonth}, or $
									{NYC_BREAKOUT_PLUS.promotionalPrice?.firstMonth})
								</li>
								<li>
									• Credit applied to your invoice the month after referee&apos;s first
									payment clears
								</li>
								<li>
									• Credits stack - no limit on number of referrals or total credits
								</li>
								<li>• No attribution window - referrals count whenever they convert</li>
							</ul>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
