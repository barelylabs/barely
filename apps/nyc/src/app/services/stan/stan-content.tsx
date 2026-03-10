'use client';

import Link from 'next/link';
import { NYC_STAN } from '@barely/const';

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
						<div className='mb-4 flex items-center justify-center gap-4'>
							<div className='text-center'>
								<span className='text-lg font-semibold text-white'>
									${NYC_STAN.price.standalone}/mo
								</span>
							</div>
							<span className='text-white/30'>|</span>
							<div className='text-center'>
								<span className='text-lg font-semibold text-purple-300'>
									${NYC_STAN.price.risingBundle}/mo for Rising+ clients
								</span>
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
							Your main TikTok has to stay &quot;on brand.&quot; Stan doesn&apos;t.
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
								Every major artist has them now—TikTok accounts that post memes,
								chopped-up clips, chaotic fan content, and all the stuff that doesn&apos;t
								fit the artist&apos;s &quot;real&quot; feed. They&apos;re breadth
								machines: pure reach and exposure at scale.
							</p>
							<p className='mb-6 text-xl font-semibold text-white'>
								Why? Because they work.
							</p>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								{[
									{
										icon: '📈',
										title: 'Algorithm-friendly infrastructure',
										desc: 'A dedicated device running a dedicated account means clean signals to the algorithm. More posts = more surface area for discovery.',
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
							good fan account is infrastructure work—dedicated devices, daily posting
							schedules, engagement management. It takes 30-60 minutes a day of consistent
							effort. You don&apos;t have that time. We do.
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* What You Get */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							What You Get
						</H>
					</AnimatedSection>

					<div className='space-y-6'>
						<AnimatedSection animation='fade-up' delay={200}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-2xl'>🎬</span>
									<div>
										<p className='font-semibold text-white'>
											Daily TikTok Posts (3x/day)
										</p>
										<p className='text-sm text-white/70'>
											Three posts per day, every day, manually posted from a dedicated
											device. No scheduling tools, no automation flags—just consistent,
											authentic content that the algorithm rewards. Chopped-up music video
											clips, AI-generated visuals, meme-format content, fan reposts, and
											whatever&apos;s trending.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={250}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-2xl'>📱</span>
									<div>
										<p className='font-semibold text-white'>
											Dedicated Device Infrastructure
										</p>
										<p className='text-sm text-white/70'>
											Your Stan account runs on its own device with its own IP. This
											isn&apos;t a shortcut—it&apos;s how you build a clean account that
											the algorithm trusts. No shared devices, no VPNs, no red flags.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-2xl'>🎨</span>
									<div>
										<p className='font-semibold text-white'>
											Cohesive Aesthetic, Defined with You
										</p>
										<p className='text-sm text-white/70'>
											During onboarding, we establish the account&apos;s visual identity
											together—color palette, content types, tone, what&apos;s on-brand
											and what&apos;s off-limits. Then we run with it.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={350}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-2xl'>💬</span>
									<div>
										<p className='font-semibold text-white'>We Reply to Everything</p>
										<p className='text-sm text-white/70'>
											DMs and comments get responses. This is how you build a community,
											not just an audience. We handle the daily engagement so the account
											feels alive.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-2xl'>🛡️</span>
									<div>
										<p className='font-semibold text-white'>Shadowban Protection</p>
										<p className='text-sm text-white/70'>
											Dedicated devices, manual posting, and careful content practices
											minimize shadowban risk. If something does get flagged, we know how
											to handle it.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={450}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-2xl'>📊</span>
									<div>
										<p className='font-semibold text-white'>
											Monthly Performance Check-Ins
										</p>
										<p className='text-sm text-white/70'>
											Quick recap of what&apos;s landing, what&apos;s growing, and any
											adjustments for next month.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={500}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-2xl'>🔧</span>
									<div>
										<p className='font-semibold text-white'>
											Additional Services Negotiable
										</p>
										<p className='text-sm text-white/70'>
											Need something beyond the standard scope? Cross-pollination with
											your main account, coordinated release campaigns, or custom content
											types—we&apos;re flexible. Let&apos;s talk about what you need.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>
					</div>

					{/* IG Reels Add-on */}
					<AnimatedSection animation='fade-up' delay={550}>
						<div className='glass mt-8 rounded-xl border border-purple-500/20 p-6'>
							<div className='flex items-start gap-4'>
								<span className='text-2xl'>📸</span>
								<div>
									<p className='font-semibold text-purple-300'>
										Instagram Reels Add-On (+${NYC_STAN.igReelsAddon}/mo)
									</p>
									<p className='text-sm text-white/70'>
										Repurpose your TikTok content to Instagram Reels for additional reach.
										Same content, different platform, more surface area.
									</p>
								</div>
							</div>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={600}>
						<div className='mt-8 text-center'>
							<MarketingButton
								marketingLook='hero-primary'
								onClick={() => handleCtaClick('features', 'stan', { service: 'stan' })}
							>
								Get Started with Stan
							</MarketingButton>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* Breadth vs. Depth */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-8 text-center text-3xl md:text-4xl'>
							Breadth vs. Depth
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass rounded-2xl p-8'>
							<p className='mb-6 text-lg leading-relaxed text-white/80'>
								Stan is a <span className='font-semibold text-white'>breadth</span>{' '}
								play—maximizing your surface area for discovery. It&apos;s how new
								listeners find you.
							</p>
							<p className='mb-6 text-lg leading-relaxed text-white/80'>
								Our standard services (Bedroom+, Rising+, Breakout+) are{' '}
								<span className='font-semibold text-white'>depth</span>
								—converting that exposure into real fans, real revenue, and real careers.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								The best results come from both working together. That&apos;s why Stan is
								discounted for Rising+ clients and included with Breakout+.
							</p>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* Setup & Onboarding */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-8 text-center text-3xl md:text-4xl'>
							Setup & Onboarding
						</H>
					</AnimatedSection>

					<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
						<AnimatedSection animation='fade-up' delay={200}>
							<div className='glass rounded-xl p-6 text-center'>
								<p className='mb-2 text-2xl font-bold text-white'>
									${NYC_STAN.setupFees.simple}
								</p>
								<p className='font-semibold text-white'>Simple Setup</p>
								<p className='mt-2 text-sm text-white/70'>
									Existing account with clear direction. We learn your vibe and start
									posting.
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<div className='glass rounded-xl p-6 text-center'>
								<p className='mb-2 text-2xl font-bold text-white'>
									${NYC_STAN.setupFees.customMin}-${NYC_STAN.setupFees.customMax}
								</p>
								<p className='font-semibold text-white'>Custom Setup</p>
								<p className='mt-2 text-sm text-white/70'>
									New account creation with custom branding, aesthetic development, and
									content system design.
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<div className='glass rounded-xl border border-purple-500/20 p-6 text-center'>
								<p className='mb-2 text-2xl font-bold text-purple-300'>Waived</p>
								<p className='font-semibold text-purple-300'>Rising+ Clients</p>
								<p className='mt-2 text-sm text-white/70'>
									Setup fee waived for Rising+ clients adding Stan to their plan.
								</p>
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
								title: 'Account Setup on Dedicated Device',
								desc: 'We set up (or take over) the fan account on its own device with proper branding that looks authentic, not corporate.',
							},
							{
								step: '3',
								title: 'Content System Build',
								desc: 'We build out the content pipeline—visual templates, content categories, posting schedule—and get your approval on the general direction.',
							},
							{
								step: '4',
								title: 'Daily Execution (3x Manual Posts)',
								desc: "Three posts per day, every day, manually posted from the dedicated device. You don't have to think about it.",
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
										"Artists who know they need consistent TikTok presence but don't have time",
										'Musicians whose main feed is too curated for chaotic fan content',
										'Artists on Rising+ or Breakout+ who want breadth alongside their depth campaigns',
										'Indie labels looking to build TikTok presence across multiple artists',
										"Anyone who's tried to maintain a fan account and burned out",
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
										'Artists looking for a social media manager for their main account',
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
										<th className='p-4 text-center text-white/70'>Standalone</th>
										<th className='p-4 text-center text-white/70'>Rising+ Bundle</th>
										<th className='p-4 text-center text-white/70'>Included With</th>
									</tr>
								</thead>
								<tbody>
									<tr className='border-b border-white/10'>
										<td className='p-4 font-semibold text-white'>Stan (TikTok)</td>
										<td className='p-4 text-center text-white'>
											${NYC_STAN.price.standalone}/month
										</td>
										<td className='p-4 text-center text-purple-300'>
											${NYC_STAN.price.risingBundle}/month
										</td>
										<td className='p-4 text-center text-purple-300'>Breakout+</td>
									</tr>
									<tr>
										<td className='p-4 font-semibold text-white/70'>+ IG Reels Add-On</td>
										<td className='p-4 text-center text-white/70'>
											+${NYC_STAN.igReelsAddon}/month
										</td>
										<td className='p-4 text-center text-white/70'>
											+${NYC_STAN.igReelsAddon}/month
										</td>
										<td className='p-4 text-center text-white/50'>—</td>
									</tr>
								</tbody>
							</table>
						</div>
					</AnimatedSection>

					{/* Volume Pricing */}
					<AnimatedSection animation='fade-up' delay={300}>
						<div className='mt-8'>
							<H size='4' className='mb-4 text-center text-white/80'>
								Volume Pricing
							</H>
							<div className='glass overflow-hidden rounded-xl'>
								<table className='w-full'>
									<thead>
										<tr className='border-b border-white/10'>
											<th className='p-4 text-left text-white/70'>Accounts</th>
											<th className='p-4 text-center text-white/70'>Per Account/Month</th>
										</tr>
									</thead>
									<tbody>
										<tr className='border-b border-white/10'>
											<td className='p-4 text-white'>2-4 accounts</td>
											<td className='p-4 text-center text-white'>
												${NYC_STAN.volumePricing.twoToFour}/month
											</td>
										</tr>
										<tr className='border-b border-white/10'>
											<td className='p-4 text-white'>5+ accounts</td>
											<td className='p-4 text-center text-white'>
												${NYC_STAN.volumePricing.fivePlus}/month
											</td>
										</tr>
										<tr>
											<td className='p-4 text-purple-300'>
												Label Package (up to {NYC_STAN.labelPackage.maxAccounts})
											</td>
											<td className='p-4 text-center text-purple-300'>
												${NYC_STAN.labelPackage.price.toLocaleString()}/month
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={350}>
						<p className='mt-6 text-center text-sm text-white/60'>
							Setup fee: ${NYC_STAN.setupFees.simple} (simple) or $
							{NYC_STAN.setupFees.customMin}-${NYC_STAN.setupFees.customMax} (custom).
							Waived for Rising+ clients.
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

			{/* For Labels & Management Companies */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<div className='glass rounded-2xl border border-purple-500/20 p-8'>
							<H size='3' className='mb-4 text-2xl md:text-3xl'>
								For Labels & Management Companies
							</H>
							<p className='mb-4 text-lg text-white/80'>
								Managing TikTok presence across a roster? Our label package covers up to{' '}
								{NYC_STAN.labelPackage.maxAccounts} accounts for $
								{NYC_STAN.labelPackage.price.toLocaleString()}/month with volume discounts
								for larger rosters.
							</p>
							<Link href='/services/labels'>
								<MarketingButton marketingLook='glass' size='sm'>
									Learn more about label partnerships →
								</MarketingButton>
							</Link>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* FAQ */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
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
								a: "TikTok is the primary platform. It's where fan accounts have the best organic reach and discovery potential right now. Instagram Reels is available as a paid add-on for $150/month—same content repurposed to a second platform.",
							},
							{
								q: 'Do I need to approve every post?',
								a: "No—that would defeat the purpose. During onboarding, we establish your boundaries (topics to avoid, aesthetic guidelines, etc.), and then we run with it. You'll have view access to the account and can flag anything, but day-to-day approval isn't required.",
							},
							{
								q: 'What if the account takes off and needs more attention?',
								a: "Good problem to have. If a Stan account grows significantly and requires more active moderation, we'll talk about adjusting the scope. Additional services are always negotiable.",
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
								a: "A generalist social media manager would cost $1,500-3,000/month and probably wouldn't understand fan account culture or TikTok-specific growth patterns. We're specialists in this specific format, with dedicated device infrastructure and a systemized workflow that keeps costs down while maintaining quality.",
							},
							{
								q: "What if I don't have much footage?",
								a: "We can work with limited assets—AI-generated visuals, lyric posts, meme formats, and creative repurposing go a long way. But the more raw material you can provide, the better the account will perform. We'll talk through what you have during onboarding.",
							},
							{
								q: 'Do you offer volume discounts?',
								a: `Yes. 2-4 accounts are $${NYC_STAN.volumePricing.twoToFour}/month each, 5+ accounts are $${NYC_STAN.volumePricing.fivePlus}/month each, and we have a label package for up to ${NYC_STAN.labelPackage.maxAccounts} accounts at $${NYC_STAN.labelPackage.price.toLocaleString()}/month.`,
							},
							{
								q: 'What does the setup fee cover?',
								a: `$${NYC_STAN.setupFees.simple} for simple setups (existing account, clear direction) or $${NYC_STAN.setupFees.customMin}-$${NYC_STAN.setupFees.customMax} for custom setups (new account creation, branding, aesthetic development). Setup fee is waived for Rising+ clients.`,
							},
							{
								q: 'Why TikTok instead of Instagram?',
								a: "TikTok's algorithm rewards consistent posting from clean accounts more than any other platform right now. The discovery potential for fan accounts is significantly higher on TikTok. We offer Instagram Reels as an add-on for artists who want both.",
							},
							{
								q: 'What does engagement include?',
								a: 'We respond to DMs and comments on the Stan account. This is community management for the fan account specifically—not your main account. If you need main account management, that falls under additional negotiable services.',
							},
							{
								q: 'How do you handle shadowbans?',
								a: "Dedicated devices, manual posting, and careful content practices are our first line of defense. We don't use scheduling tools or automation that could flag the account. If something does get flagged, we have protocols for recovery.",
							},
						].map((item, index) => (
							<AnimatedSection key={index} animation='fade-up' delay={200 + index * 50}>
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
