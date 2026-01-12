'use client';

import Link from 'next/link';
import { NYC_STAN, NYC_STAN_PLUS } from '@barely/const';

import { Icon } from '@barely/ui/icon';
import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../../components/marketing/animated-section';
import { MarketingButton } from '../../../components/marketing/button';
import { useContactModal } from '../../../contexts/contact-modal-context';
import { useCalComUrl } from '../../../hooks/use-cal-com-url';
import { useTrackCta } from '../../../hooks/use-track-cta';

export function StanContent() {
	const { open: openContactModal } = useContactModal();
	const calComUrl = useCalComUrl();
	const { trackCta } = useTrackCta();

	const handleCtaClick = (
		ctaLocation: 'hero' | 'features' | 'pricing' | 'faq' | 'footer',
		service: 'stan' | 'rising_with_stan',
		options?: { service?: 'stan' | 'rising'; stanAddon?: boolean },
	) => {
		void trackCta({ ctaType: 'contact_form', ctaLocation, service });
		openContactModal(options);
	};

	const handleDiscoveryClick = (
		ctaLocation: 'hero' | 'features' | 'pricing' | 'faq' | 'footer',
	) => {
		void trackCta({ ctaType: 'discovery_call', ctaLocation });
	};

	return (
		<main className='pt-16'>
			{/* Page Header */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<div className='mb-4 space-y-1'>
							<span className='block text-sm font-medium text-purple-300'>
								First Month Special
							</span>
							<div className='flex items-center justify-center gap-4'>
								<div className='text-center'>
									<span className='block text-sm text-white/50'>Stan</span>
									<span className='text-white/40 line-through'>
										${NYC_STAN.price.addon}
									</span>
									<span className='ml-2 text-purple-300'>
										${NYC_STAN.promotionalPrice.addon}/mo
									</span>
								</div>
								<span className='text-white/30'>|</span>
								<div className='text-center'>
									<span className='block text-sm text-white/50'>Stan+</span>
									<span className='text-white/40 line-through'>
										${NYC_STAN_PLUS.price.addon}
									</span>
									<span className='ml-2 text-purple-300'>
										${NYC_STAN_PLUS.promotionalPrice.addon}/mo
									</span>
								</div>
							</div>
						</div>
						<H
							size='1'
							className='gradient-text mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'
						>
							Stan
						</H>
						<p className='mb-4 text-2xl text-white md:text-3xl'>
							Fan Account Management for Artists Who Get It
						</p>
						<p className='text-lg text-white/70'>
							Your main Instagram has to stay &quot;on brand.&quot; Stan doesn&apos;t.
						</p>

						{/* Hero CTA */}
						<div className='mt-10'>
							<MarketingButton
								marketingLook='hero-primary'
								onClick={() => handleCtaClick('hero', 'stan', { service: 'stan' })}
							>
								Get Started
							</MarketingButton>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* The Case for Fan Accounts */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-8 text-center text-3xl md:text-4xl'>
							The Case for Fan Accounts
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass mb-8 rounded-2xl p-8'>
							<p className='mb-6 text-lg leading-relaxed text-white/80'>
								Every major artist has them now—unofficial-looking Instagram accounts that
								post memes, chopped-up clips, chaotic fan content, and all the stuff that
								doesn&apos;t fit the artist&apos;s &quot;real&quot; feed.
							</p>
							<p className='mb-6 text-xl font-semibold text-white'>
								Why? Because they work.
							</p>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								{[
									{
										icon: '📈',
										title: 'Algorithm-friendly',
										desc: 'More posts = more surface area for discovery',
									},
									{
										icon: '💬',
										title: 'Engagement magnets',
										desc: "Fans interact differently with 'fan' content than official posts",
									},
									{
										icon: '🎨',
										title: 'Brand-safe experimentation',
										desc: 'Test content styles without risking your main aesthetic',
									},
									{
										icon: '🏠',
										title: 'Community builders',
										desc: 'Superfans want a place that feels like theirs',
									},
								].map((item, index) => (
									<div key={index} className='flex items-start gap-3'>
										<span className='text-2xl'>{item.icon}</span>
										<div>
											<p className='font-semibold text-white'>{item.title}</p>
											<p className='text-sm text-white/70'>{item.desc}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={300}>
						<p className='text-center text-lg text-white/80'>
							<span className='font-semibold text-white'>The problem:</span> Running a
							good fan account takes 30-60 minutes a day of consistent posting. You
							don&apos;t have that time. We do.
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* What You Get - Stan */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							What You Get
						</H>
					</AnimatedSection>

					<div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
						{/* Stan Tier */}
						<AnimatedSection animation='slide-right' delay={200}>
							<div className='glass h-full rounded-xl p-8'>
								<div className='mb-6 flex items-center justify-between'>
									<H size='3' className='text-purple-300'>
										{NYC_STAN.name}
									</H>
									<div className='text-right'>
										<p className='text-sm text-white/50'>
											${NYC_STAN.price.addon}/mo add-on
										</p>
										<p className='text-sm text-white/50'>
											${NYC_STAN.price.standalone}/mo standalone
										</p>
									</div>
								</div>

								<div className='space-y-6'>
									<div className='flex items-start gap-4'>
										<span className='text-2xl'>🎬</span>
										<div>
											<p className='font-semibold text-white'>Daily Instagram Posts</p>
											<p className='text-sm text-white/70'>
												Consistent content every day—no gaps, no &quot;sorry I&apos;ve
												been quiet&quot; energy. We keep your fan account active so the
												algorithm keeps pushing it.
											</p>
										</div>
									</div>

									<div className='flex items-start gap-4'>
										<span className='text-2xl'>🎨</span>
										<div>
											<p className='font-semibold text-white'>Content Mix That Works</p>
											<p className='text-sm text-white/70'>
												Chopped-up music video clips, AI-generated visuals with meme
												captions, fan content reposts (with credit), throwback moments,
												lyric posts, and whatever&apos;s trending that week.
											</p>
										</div>
									</div>

									<div className='flex items-start gap-4'>
										<span className='text-2xl'>📦</span>
										<div>
											<p className='font-semibold text-white'>
												You Provide the Raw Material
											</p>
											<p className='text-sm text-white/70'>
												Send us your video files, photos, and any assets you have.
												We&apos;ll slice them up and keep the content engine running.
											</p>
										</div>
									</div>

									<div className='flex items-start gap-4'>
										<span className='text-2xl'>📊</span>
										<div>
											<p className='font-semibold text-white'>
												Monthly Performance Check-In
											</p>
											<p className='text-sm text-white/70'>
												Quick recap of what&apos;s landing, what&apos;s growing, and any
												adjustments for next month.
											</p>
										</div>
									</div>
								</div>

								<div className='mt-6 border-t border-white/10 pt-6'>
									<MarketingButton
										marketingLook='glass'
										fullWidth
										onClick={() =>
											handleCtaClick('features', 'stan', { service: 'stan' })
										}
									>
										Get Started with Stan
									</MarketingButton>
								</div>
							</div>
						</AnimatedSection>

						{/* Stan+ Tier */}
						<AnimatedSection animation='slide-left' delay={300}>
							<div className='glass h-full rounded-xl border border-purple-500/30 p-8'>
								<div className='mb-6 flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<H size='3' className='text-purple-300'>
											{NYC_STAN_PLUS.name}
										</H>
										<span className='rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300'>
											Most Popular
										</span>
									</div>
									<div className='text-right'>
										<p className='text-sm text-white/50'>
											${NYC_STAN_PLUS.price.addon}/mo add-on
										</p>
										<p className='text-sm text-white/50'>
											${NYC_STAN_PLUS.price.standalone}/mo standalone
										</p>
									</div>
								</div>

								<p className='mb-6 text-sm text-purple-300'>
									Included with Breakout+ at no extra cost
								</p>

								<p className='mb-6 text-white/80'>Everything in Stan, plus:</p>

								<div className='space-y-6'>
									<div className='flex items-start gap-4'>
										<span className='text-2xl'>💬</span>
										<div>
											<p className='font-semibold text-white'>
												Active Community Management
											</p>
											<p className='text-sm text-white/70'>
												We don&apos;t just post and ghost. Stan+ includes daily
												engagement: responding to comments, reposting fan stories, and
												building actual community around the account.
											</p>
										</div>
									</div>

									<div className='flex items-start gap-4'>
										<span className='text-2xl'>🔄</span>
										<div>
											<p className='font-semibold text-white'>
												Cross-Pollination with Your Main
											</p>
											<p className='text-sm text-white/70'>
												Strategic comment seeding on your official posts, story reposts
												that drive traffic both directions, and coordination with your
												release calendar.
											</p>
										</div>
									</div>

									<div className='flex items-start gap-4'>
										<span className='text-2xl'>🎯</span>
										<div>
											<p className='font-semibold text-white'>Growth Tactics</p>
											<p className='text-sm text-white/70'>
												Hashtag strategy, engagement pods, collaboration with other fan
												accounts in your genre, and trend-jacking when opportunities
												arise.
											</p>
										</div>
									</div>

									<div className='flex items-start gap-4'>
										<span className='text-2xl'>📈</span>
										<div>
											<p className='font-semibold text-white'>
												Monthly Strategy Check-Ins
											</p>
											<p className='text-sm text-white/70'>
												Regular reviews to optimize what&apos;s working and pivot quickly
												when something takes off.
											</p>
										</div>
									</div>
								</div>

								<div className='mt-6 border-t border-purple-500/20 pt-6'>
									<MarketingButton
										marketingLook='hero-primary'
										fullWidth
										onClick={() =>
											handleCtaClick('features', 'rising_with_stan', {
												service: 'rising',
												stanAddon: true,
											})
										}
									>
										Get Started with Stan+
									</MarketingButton>
								</div>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* The Process */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							The Process
						</H>
					</AnimatedSection>

					<div className='space-y-6'>
						{[
							{
								step: '1',
								title: 'Onboarding Call (30 min)',
								desc: "We learn your vibe, aesthetic boundaries, and what's off-limits. You share access to your asset library.",
							},
							{
								step: '2',
								title: 'Account Setup',
								desc: 'We create (or take over) the fan account with proper branding that looks authentic, not corporate.',
							},
							{
								step: '3',
								title: 'Content Calendar',
								desc: "We build out the first month's content mix and get your approval on the general direction.",
							},
							{
								step: '4',
								title: 'Daily Execution',
								desc: "Posts go out every day. You don't have to think about it.",
							},
							{
								step: '5',
								title: 'Monthly Review',
								desc: "We show you what's working and adjust for the next month.",
							},
						].map((item, index) => (
							<AnimatedSection
								key={index}
								animation='slide-right'
								delay={200 + index * 100}
							>
								<div className='flex gap-4'>
									<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 font-bold text-purple-300'>
										{item.step}
									</div>
									<div>
										<p className='font-semibold text-white'>{item.title}</p>
										<p className='text-white/70'>{item.desc}</p>
									</div>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* Perfect For / Not Right For */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
						<AnimatedSection animation='slide-right'>
							<div className='glass h-full rounded-xl border-green-500/20 p-8'>
								<H size='4' className='mb-6 text-green-500'>
									Perfect For:
								</H>
								<ul className='space-y-3'>
									{[
										"Artists who know they need a fan account but don't have time to run one",
										"Musicians whose 'main' feed is too curated to post casual content",
										"Anyone who's tried to maintain a fan account and burned out after 2 weeks",
										'Artists on Rising+ or Breakout+ who want to amplify their campaign reach',
										'Indie labels looking to build buzz across multiple artists',
									].map((item, index) => (
										<li key={index} className='flex items-start gap-3'>
											<span className='mt-0.5 text-green-500'>✓</span>
											<span className='text-white/80'>{item}</span>
										</li>
									))}
								</ul>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-left'>
							<div className='glass h-full rounded-xl border-red-500/20 p-8'>
								<H size='4' className='mb-6 text-red-500'>
									Not Right For:
								</H>
								<ul className='space-y-3'>
									{[
										'Artists who want direct control over every post (this is hands-off by design)',
										"Musicians who aren't comfortable with meme-style or casual content",
										'Projects with very limited visual assets (we need raw material to work with)',
									].map((item, index) => (
										<li key={index} className='flex items-start gap-3'>
											<span className='mt-0.5 text-red-500'>✗</span>
											<span className='text-white/80'>{item}</span>
										</li>
									))}
								</ul>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* Pricing Table */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							Pricing
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass overflow-hidden rounded-xl'>
							<table className='w-full'>
								<thead>
									<tr className='border-b border-white/10'>
										<th className='p-4 text-left text-white/70'></th>
										<th className='p-4 text-center text-white/70'>
											Add-On
											<span className='block text-xs'>(with Bedroom+ or Rising+)</span>
										</th>
										<th className='p-4 text-center text-white/70'>Standalone</th>
										<th className='p-4 text-center text-white/70'>Included With</th>
									</tr>
								</thead>
								<tbody>
									<tr className='border-b border-white/10'>
										<td className='p-4 font-semibold text-white'>{NYC_STAN.name}</td>
										<td className='p-4 text-center text-white'>
											${NYC_STAN.price.addon}/month
										</td>
										<td className='p-4 text-center text-white'>
											${NYC_STAN.price.standalone}/month
										</td>
										<td className='p-4 text-center text-white/50'>—</td>
									</tr>
									<tr>
										<td className='p-4 font-semibold text-purple-300'>
											{NYC_STAN_PLUS.name}
										</td>
										<td className='p-4 text-center text-white'>
											${NYC_STAN_PLUS.price.addon}/month
										</td>
										<td className='p-4 text-center text-white'>
											${NYC_STAN_PLUS.price.standalone}/month
										</td>
										<td className='p-4 text-center text-purple-300'>Breakout+</td>
									</tr>
								</tbody>
							</table>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={300}>
						<p className='mt-6 text-center text-sm italic text-purple-300'>
							First month special: {NYC_STAN.promotionalPrice.description} pricing
							available
						</p>
					</AnimatedSection>

					{/* Discovery Call CTA */}
					<AnimatedSection animation='fade-up' delay={400}>
						<div className='mt-12 text-center'>
							<p className='mb-4 text-white/80'>Ready to get started?</p>
							<a
								href={calComUrl}
								target='_blank'
								rel='noopener noreferrer'
								onClick={() => handleDiscoveryClick('pricing')}
							>
								<MarketingButton
									marketingLook='scientific'
									className='inline-flex items-center gap-2'
								>
									<Icon.calendar className='h-4 w-4' />
									Book Free 30-Min Strategy Call
								</MarketingButton>
							</a>
							<p className='mt-4 text-sm text-white/60'>
								Or{' '}
								<button
									onClick={() => handleCtaClick('pricing', 'stan', { service: 'stan' })}
									className='text-purple-300 underline hover:text-purple-200'
								>
									send a message
								</button>
							</p>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* FAQ */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							FAQ
						</H>
					</AnimatedSection>

					<div className='space-y-6'>
						{[
							{
								q: 'What platform do you post on?',
								a: "Instagram only for now. We've found it's where fan accounts have the most established playbook and best engagement patterns. TikTok fan accounts may be available in the future.",
							},
							{
								q: 'Do I need to approve every post?',
								a: "No—that would defeat the purpose. During onboarding, we establish your boundaries (topics to avoid, aesthetic guidelines, etc.), and then we run with it. You'll have view access to the account and can flag anything, but day-to-day approval isn't required.",
							},
							{
								q: 'What if the account takes off and needs more attention?',
								a: "Good problem to have. If a Stan account grows significantly and requires more active moderation, we'll talk about adjusting the scope. Stan+ is designed to handle more active accounts.",
							},
							{
								q: 'Can you take over an existing fan account?',
								a: 'Yes, if you have access to it. We can also start fresh if that makes more sense.',
							},
							{
								q: 'What do you need from me?',
								a: "Access to video files, photos, artwork—anything visual we can work with. The more assets you provide, the more variety we can create. We'll also need your input during onboarding on tone, boundaries, and any ongoing release calendar updates.",
							},
							{
								q: 'How is this different from hiring a social media manager?',
								a: "A generalist social media manager would cost $1,500-3,000/month and probably wouldn't understand fan account culture. We're specialists in this specific format, with a systemized workflow that keeps costs down while maintaining quality.",
							},
						].map((item, index) => (
							<AnimatedSection key={index} animation='fade-up' delay={200 + index * 100}>
								<div className='glass rounded-xl p-6'>
									<H size='5' className='mb-3'>
										{item.q}
									</H>
									<p className='text-white/70'>{item.a}</p>
								</div>
							</AnimatedSection>
						))}
					</div>

					{/* FAQ Soft CTA */}
					<AnimatedSection animation='fade-up' delay={800}>
						<p className='mt-10 text-center text-white/60'>
							Still have questions?{' '}
							<a
								href={calComUrl}
								target='_blank'
								rel='noopener noreferrer'
								onClick={() => handleDiscoveryClick('faq')}
								className='text-purple-300 underline hover:text-purple-200'
							>
								Schedule a quick call
							</a>
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* CTA */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-md text-center'>
					<AnimatedSection animation='scale'>
						<MarketingButton
							marketingLook='hero-primary'
							onClick={() => handleCtaClick('footer', 'stan', { service: 'stan' })}
						>
							Get Started
						</MarketingButton>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<p className='mt-8 text-white/60'>
							Questions?{' '}
							<a
								href='mailto:hello@barely.nyc'
								className='text-purple-300 underline hover:text-purple-200'
							>
								Email me directly
							</a>
						</p>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={300}>
						<div className='mt-8'>
							<Link href='/services'>
								<MarketingButton marketingLook='glass' size='sm'>
									← Back to All Services
								</MarketingButton>
							</Link>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
