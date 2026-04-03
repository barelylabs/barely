'use client';

import Link from 'next/link';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../../components/marketing/animated-section';
import { MarketingButton } from '../../../components/marketing/button';

export function SwarmContent() {
	return (
		<main className='pt-16'>
			{/* Hero Section */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<div className='mb-4'>
							<span className='inline-block rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300'>
								Pilot Program
							</span>
						</div>
						<H
							size='1'
							className='gradient-text mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'
						>
							Swarm
						</H>
						<p className='mb-4 text-2xl text-white md:text-3xl'>
							Coordinated Micro-Creator Campaigns for Singles That Need Momentum
						</p>
						<p className='mb-8 text-lg text-white/70 md:text-xl'>
							Your ads reach people who scroll past. Swarm puts your music in the hands of
							creators whose audiences actually listen.
						</p>
						<div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
							<a href='mailto:adam@barely.nyc?subject=Barely%20Swarm%20Inquiry'>
								<MarketingButton marketingLook='hero-primary' size='lg'>
									Get Started
								</MarketingButton>
							</a>
							<a href='#pricing'>
								<MarketingButton marketingLook='hero-secondary' size='lg'>
									See Pricing Below
								</MarketingButton>
							</a>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* The Case for Fractional Media */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-8 text-center text-3xl md:text-4xl'>
							The Case for Fractional Media
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='mb-12 space-y-6'>
							<p className='text-lg leading-relaxed text-white/80'>
								Traditional music marketing puts all your budget into one or two channels
								— ads, playlists, maybe a PR push. Swarm takes a different approach:
								distribute your single across dozens of small, trusted voices in the
								communities where your future fans already live.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								It works because of how discovery actually happens now. People don&apos;t
								find new music from ads. They find it when a BookTok creator soundtracks a
								reading vlog with it, when a film account pairs it with an A24 mood board,
								when a vinyl collector posts an unboxing. The song shows up in context,
								attached to something the viewer already cares about. It feels discovered,
								not promoted.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								One big post from one big account is a lottery ticket. Twenty posts from
								twenty niche creators in the same week is a signal — to the algorithm, to
								playlist editors, and to the listeners themselves. That&apos;s the
								difference between hoping for a moment and engineering one.
							</p>
						</div>
					</AnimatedSection>

					<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
						{[
							{
								emoji: '🌊',
								title: 'Distributed reach',
								description:
									'Many small, targeted placements across niche communities create a wider net than a single large placement ever could.',
							},
							{
								emoji: '🎯',
								title: 'Context over impressions',
								description:
									'Your music lands inside content people already care about — not interrupting their feed, but enhancing it.',
							},
							{
								emoji: '📈',
								title: 'Algorithmic signal',
								description:
									"Coordinated creator activity around a single sound tells TikTok and Instagram that something is happening. That's how organic discovery gets triggered.",
							},
							{
								emoji: '🤝',
								title: 'Real people, real audiences',
								description:
									'Every creator in the network has a genuine, engaged following. No bots, no fake engagement, no inflated metrics.',
							},
						].map((benefit, i) => (
							<AnimatedSection key={i} animation='fade-up' delay={300 + i * 100}>
								<div className='glass h-full rounded-xl p-6'>
									<div className='flex items-start gap-4'>
										<span className='text-2xl'>{benefit.emoji}</span>
										<div>
											<p className='font-semibold text-white'>{benefit.title}</p>
											<p className='text-sm text-white/70'>{benefit.description}</p>
										</div>
									</div>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* What You Get */}
			<section className='px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							What You Get
						</H>
					</AnimatedSection>

					<div className='space-y-6'>
						{[
							{
								emoji: '🎬',
								title: 'Targeted Community Mapping',
								description:
									'We identify the specific micro-communities where your music belongs — not just "music TikTok," but the niche corners where your sound resonates. BookTok, FilmTok, vinyl culture, analog photography, dark academia, coffee culture, van life — wherever your audience actually lives.',
							},
							{
								emoji: '📋',
								title: 'Creator Matching & Outreach',
								description:
									'We source and vet creators from our network who align with your sound and aesthetic. Every creator is hand-selected based on content style, audience fit, and engagement quality. You approve the creator list before we move forward.',
							},
							{
								emoji: '🎯',
								title: 'Campaign Briefing & Coordination',
								description:
									'Each creator gets a tailored brief — your track, the vibe, a one-liner on the story, and creative freedom to make it their own. We coordinate posting windows to concentrate activity into a 1-2 week burst around your release date, maximizing algorithmic signal.',
							},
							{
								emoji: '💬',
								title: 'Paid Creator Placements',
								description:
									'Every creator in a Swarm campaign is compensated for their work. This isn\'t a gifting play or a "post for exposure" ask — it\'s a professional media buy distributed across micro-creators instead of a single ad platform.',
							},
							{
								emoji: '📊',
								title: 'Campaign Report',
								description:
									'After the campaign wraps, you get a full Notion report: every creator post linked, engagement metrics per post, aggregate reach and engagement, and observations on what resonated and what to adjust for next time.',
							},
						].map((feature, i) => (
							<AnimatedSection key={i} animation='fade-up' delay={200 + i * 100}>
								<div className='glass rounded-xl p-6'>
									<div className='flex items-start gap-4'>
										<span className='text-2xl'>{feature.emoji}</span>
										<div>
											<p className='font-semibold text-white'>{feature.title}</p>
											<p className='text-sm text-white/70'>{feature.description}</p>
										</div>
									</div>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* Why the Minimum Matters */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-8 text-center text-3xl md:text-4xl'>
							Why the Minimum Matters
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass rounded-2xl p-8'>
							<div className='space-y-6'>
								<p className='text-lg leading-relaxed text-white/80'>
									A Swarm campaign has a $2,000 minimum creator spend ($2,500 total with
									coordination fee). Here&apos;s why.
								</p>
								<p className='text-lg leading-relaxed text-white/80'>
									Micro-creator campaigns only work when they create density — enough
									posts, concentrated in a tight enough window, to register as a signal
									rather than noise. The research is clear on what that threshold looks
									like:
								</p>
								<p className='text-lg leading-relaxed text-white/80'>
									<strong className='text-white'>
										15-25 creators posting within a 5-7 day window
									</strong>{' '}
									is the minimum for a coordinated burst that TikTok and Instagram&apos;s
									algorithms can detect as a trend forming around a sound. Fewer than
									that, and each post exists in isolation — no compounding effect, no
									algorithmic pickup, no &quot;why am I seeing this everywhere?&quot;
									reaction from listeners.
								</p>
								<p className='text-lg leading-relaxed text-white/80'>
									At typical per-post rates for music-adjacent micro-creators ($50-$150
									per TikTok in niches like BookTok, FilmTok, vinyl, and lifestyle
									accounts), activating 15-25 creators costs $750-$3,750 in creator fees.
									The $2,000 minimum puts you solidly in the range where a campaign can
									generate real momentum.
								</p>
								<p className='text-lg leading-relaxed text-white/80'>
									Below this threshold, your budget is almost always better spent on
									direct Meta conversion ads — which is exactly what our Bedroom+,
									Rising+, and Breakout+ campaigns already handle. Swarm exists
									specifically for the situations where distributed organic-feeling reach
									matters more than direct-response advertising: release week energy,
									playlist pitching support, building the perception that a single is
									&quot;everywhere.&quot;
								</p>
								<p className='text-lg leading-relaxed text-white/80'>
									This is also what makes our{' '}
									<Link
										href='/services/stan'
										className='text-purple-300 underline-offset-4 transition-all hover:text-purple-200 hover:underline'
									>
										Stan
									</Link>{' '}
									service a compelling complement. Stan is an owned asset — a fan account
									you control, posting daily, compounding over months. Guaranteed output,
									guaranteed volume. Swarm is a burst play — renting reach from real
									creators in real communities for a specific moment. Different tools for
									different jobs, both pointed at breadth.
								</p>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* The Process */}
			<section className='px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
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
								title: 'Discovery Call (30 min)',
								description:
									"We learn about your release, your target listener, and the communities you want to reach. We'll discuss timeline, budget, and what success looks like for this campaign.",
							},
							{
								step: '2',
								title: 'Community Mapping & Creator Matching',
								description:
									'We identify the right micro-communities for your sound and source creators from our network who fit. You review and approve the creator list before anything goes live.',
							},
							{
								step: '3',
								title: 'Briefing & Coordinated Burst',
								description:
									'Each creator gets a brief with your track, release context, and creative direction — loose enough for authenticity, specific enough for brand alignment. We coordinate posting into a tight 1-2 week window around your release.',
							},
							{
								step: '4',
								title: 'Reporting & Debrief',
								description:
									'You receive a full Notion report with every post linked, per-creator engagement metrics, and aggregate campaign performance. We walk through what worked and what to refine for next time.',
							},
						].map((item, i) => (
							<AnimatedSection key={i} animation='slide-right' delay={200 + i * 100}>
								<div className='flex gap-4'>
									<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 font-bold text-purple-300'>
										{item.step}
									</div>
									<div>
										<p className='font-semibold text-white'>{item.title}</p>
										<p className='text-white/70'>{item.description}</p>
									</div>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* Pricing */}
			<section
				id='pricing'
				className='bg-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24'
			>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-4 text-center text-3xl md:text-4xl'>
							Pricing
						</H>
						<p className='mb-12 text-center text-lg text-white/70'>
							Swarm campaigns use a transparent cost-plus model during the pilot program.
							You set the creator budget, and Barely adds a 25% coordination fee that
							covers community mapping, creator sourcing and vetting, briefing, campaign
							coordination, and reporting.
						</p>
					</AnimatedSection>

					{/* How It Works Table */}
					<AnimatedSection animation='fade-up' delay={200}>
						<div className='mb-8'>
							<H size='4' className='mb-4 text-purple-300'>
								How It Works
							</H>
							<div className='glass overflow-hidden rounded-xl'>
								<table className='w-full'>
									<thead>
										<tr className='border-b border-white/10'>
											<th className='px-6 py-3 text-left text-sm font-medium text-white/60'>
												Component
											</th>
											<th className='px-6 py-3 text-right text-sm font-medium text-white/60'>
												Rate
											</th>
										</tr>
									</thead>
									<tbody>
										<tr className='border-b border-white/5'>
											<td className='px-6 py-4 text-white/80'>Creator spend</td>
											<td className='px-6 py-4 text-right font-medium text-white'>
												You set the budget (minimum $2,000)
											</td>
										</tr>
										<tr className='border-b border-white/5'>
											<td className='px-6 py-4 text-white/80'>Barely coordination fee</td>
											<td className='px-6 py-4 text-right font-medium text-white'>
												25% of creator spend
											</td>
										</tr>
										<tr className='bg-purple-500/10'>
											<td className='px-6 py-4 font-semibold text-white'>
												Minimum campaign total
											</td>
											<td className='px-6 py-4 text-right font-bold text-white'>
												$2,500
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</AnimatedSection>

					{/* Example Campaigns Table */}
					<AnimatedSection animation='fade-up' delay={300}>
						<div className='mb-8'>
							<H size='4' className='mb-4 text-purple-300'>
								Example Campaigns
							</H>
							<div className='glass overflow-hidden rounded-xl'>
								<div className='overflow-x-auto'>
									<table className='w-full'>
										<thead>
											<tr className='border-b border-white/10'>
												<th className='px-6 py-3 text-left text-sm font-medium text-white/60'>
													Creator Budget
												</th>
												<th className='px-6 py-3 text-right text-sm font-medium text-white/60'>
													Coordination Fee (25%)
												</th>
												<th className='px-6 py-3 text-right text-sm font-medium text-white/60'>
													Total Cost
												</th>
												<th className='px-6 py-3 text-right text-sm font-medium text-white/60'>
													Estimated Creators
												</th>
											</tr>
										</thead>
										<tbody>
											{[
												['$2,000', '$500', '$2,500', '15-20 creators'],
												['$3,000', '$750', '$3,750', '20-30 creators'],
												['$5,000', '$1,250', '$6,250', '30-50 creators'],
											].map(([budget, fee, total, creators], i) => (
												<tr key={i} className={i < 2 ? 'border-b border-white/5' : ''}>
													<td className='px-6 py-4 text-white/80'>{budget}</td>
													<td className='px-6 py-4 text-right text-white/70'>{fee}</td>
													<td className='px-6 py-4 text-right font-medium text-white'>
														{total}
													</td>
													<td className='px-6 py-4 text-right text-white/70'>
														{creators}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={400}>
						<p className='text-sm italic text-white/60'>
							Creator counts are estimates based on typical per-post rates in
							music-adjacent micro-creator communities. Actual numbers depend on the
							specific niches and creator tiers activated.
						</p>
						<div className='mt-6 rounded-xl border-l-4 border-purple-500 bg-purple-500/10 p-6'>
							<H size='5' className='mb-2'>
								Pilot program pricing.
							</H>
							<p className='text-white/80'>
								The 25% coordination fee reflects early-access pricing as we build and
								refine the Swarm network. This rate will be revisited as the service
								matures.
							</p>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* FAQ */}
			<section className='px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							FAQ
						</H>
					</AnimatedSection>

					<div className='space-y-6'>
						{[
							{
								q: 'What platforms do Swarm campaigns run on?',
								a: "TikTok is the primary platform — it's where coordinated creator activity has the best chance of triggering algorithmic discovery around a sound. Instagram Reels is a secondary option, and YouTube Shorts is available as a third. We generally recommend concentrating your budget on one platform per campaign to maximize density rather than spreading thin across multiple platforms.",
							},
							{
								q: 'How long does a Swarm campaign run?',
								a: 'Most campaigns run 1-2 weeks, concentrated around a release moment — single drop, music video launch, or a push behind a track that\'s already gaining traction. We coordinate posting into the tightest window possible to maximize the "burst" effect. Pre-campaign setup (discovery, creator matching, briefing) typically takes 1-2 weeks before the live window.',
							},
							{
								q: 'Do I get to approve the creators?',
								a: 'Yes. You approve the creator list before any outreach or briefing happens. Individual posts are creator-led — the whole point is that the content feels authentic to their audience, not scripted by a brand. During onboarding, we establish your boundaries (tone, topics to avoid, visual guidelines), and creators work within those.',
							},
							{
								q: 'What should I expect in terms of results?',
								a: "Swarm is a discovery and momentum play, not a direct-response channel. The leading indicators we track are saves, Shazams, playlist adds, search volume lifts, and sound usage on the platform. We don't promise a specific stream count — that depends on too many variables beyond the campaign itself (the song, the artist's existing audience, timing, algorithmic variance). What we can deliver is concentrated, authentic exposure in the right communities at the right moment.",
							},
							{
								q: 'How is this different from hiring a creator marketing agency?',
								a: "Most creator agencies are built for brands, not music. They work with large creators at $500-$5,000+ per post, optimize for impressions, and charge retainers that don't make sense for indie budgets. Swarm is built specifically for independent music: we work with micro-creators ($50-$150 per post) in genre-specific communities, we price on a transparent cost-plus model, and we optimize for the specific signals that drive music discovery — saves, Shazams, playlist adds — not vanity metrics.",
							},
							{
								q: 'What do you need from me to run a campaign?',
								a: 'The track (ideally 2-3 weeks before release if you want to coordinate with the drop), any visual assets or mood references, the release date and timeline, and a conversation about which communities you want to target. The more context you can give us about your sound, your target listener, and your release strategy, the better we can match creators.',
							},
							{
								q: 'Are the creators paid?',
								a: 'Yes. Every creator in a Swarm campaign is compensated. This is a professional media buy, not an unpaid gifting play. Paying creators means we can be intentional about timing, briefing, and coordination — which is the entire point of a burst campaign.',
							},
							{
								q: 'Can I run Swarm alongside my existing Barely campaigns?',
								a: "Yes. Swarm is designed to complement release campaigns — it adds a layer of organic-feeling discovery on top of whatever direct marketing you're already running. If you're on a Rising+ or Breakout+ plan, your campaign manager can coordinate Swarm timing with your broader release strategy.",
							},
							{
								q: 'How do I see the results?',
								a: "You'll receive a Notion report after the campaign wraps. It includes links to every creator post, per-post engagement metrics (views, likes, comments, shares, sound uses), aggregate campaign reach and engagement, and our notes on what resonated and what to adjust next time.",
							},
							{
								q: 'Is there a contract or long-term commitment?',
								a: 'No. Swarm is per-campaign. You can run one campaign and evaluate, or build it into your release cycle for every single. No retainer, no minimum number of campaigns.',
							},
						].map((faq, i) => (
							<AnimatedSection key={i} animation='fade-up' delay={200 + i * 50}>
								<div className='glass rounded-xl p-6'>
									<H size='5' className='mb-3'>
										{faq.q}
									</H>
									<p className='text-white/70'>{faq.a}</p>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='scale'>
						<H size='2' className='gradient-text mb-8 text-3xl md:text-4xl lg:text-5xl'>
							Ready to try Swarm?
						</H>
						<div className='mb-6'>
							<a href='mailto:adam@barely.nyc?subject=Barely%20Swarm%20Inquiry'>
								<MarketingButton marketingLook='hero-primary' size='lg'>
									Get Started
								</MarketingButton>
							</a>
						</div>
						<p className='text-white/60'>
							Or email{' '}
							<a
								href='mailto:adam@barely.nyc?subject=Barely%20Swarm%20Inquiry'
								className='text-purple-300 underline-offset-4 transition-all hover:text-purple-200 hover:underline'
							>
								adam@barely.nyc
							</a>{' '}
							to learn more.
						</p>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
