import type { Metadata } from 'next';
import { Code2, Heart, Users, Zap } from 'lucide-react';

import { AnimatedSection } from '~/components/animated-section';
import { Container } from '~/components/container';
import { MarketingButton } from '~/components/marketing-button';
import { Heading, Lead, Subheading } from '~/components/text';
import { ValueCard } from '~/components/value-card';

export const metadata: Metadata = {
	title: 'About barely.io',
	description:
		'Learn about the team building open-source marketing tools for musicians. From materials science to music tech.',
};

function Header() {
	return (
		<Container className='pb-16 pt-24'>
			<AnimatedSection animation='fade-up' className='mx-auto max-w-4xl text-center'>
				<Heading as='h1' className='text-white'>
					Built by musicians, <span className='gradient-text'>for musicians</span>
				</Heading>
				<Lead className='mt-6 text-muted-foreground'>
					We're on a mission to democratize music marketing by building transparent,
					integrated tools that help artists understand and grow their careers without the
					black boxes or vendor lock-in.
				</Lead>
			</AnimatedSection>
		</Container>
	);
}

function Story() {
	return (
		<section className='py-24'>
			<Container>
				<div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
					<AnimatedSection animation='fade-up'>
						<Subheading>The Story</Subheading>
						<Heading as='h2' className='mt-2 text-white'>
							From PhD to music tech
						</Heading>
						<div className='mt-6 space-y-4 text-muted-foreground'>
							<p>
								Our founder spent years optimizing materials at the molecular level in
								research labs, then realized indie musicians faced the same problem -
								incredible potential buried under inefficient systems.
							</p>
							<p>
								After releasing music to "tens of listeners" and experiencing firsthand
								how fragmented and opaque music marketing tools were, they decided to
								apply the same rigorous, transparent approach from materials science to
								music technology.
							</p>
							<p>
								That's how barely.io was born - as an open-source alternative to
								expensive, disconnected tools that keep artists in the dark about their
								own data.
							</p>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass rounded-2xl p-8'>
							<h3 className='mb-6 text-xl font-semibold text-white'>Why we built this</h3>
							<ul className='space-y-4 text-muted-foreground'>
								<li className='flex items-start gap-3'>
									<span className='mt-1 text-accent'>•</span>
									<span>
										Existing tools were built for general marketing, not music careers
									</span>
								</li>
								<li className='flex items-start gap-3'>
									<span className='mt-1 text-accent'>•</span>
									<span>
										Tool stacks cost more than most indie artists' monthly income
									</span>
								</li>
								<li className='flex items-start gap-3'>
									<span className='mt-1 text-accent'>•</span>
									<span>No platform showed the real ROI of marketing campaigns</span>
								</li>
								<li className='flex items-start gap-3'>
									<span className='mt-1 text-accent'>•</span>
									<span>Musicians spent more time managing tools than making music</span>
								</li>
							</ul>
						</div>
					</AnimatedSection>
				</div>
			</Container>
		</section>
	);
}

function Values() {
	return (
		<section className='bg-card py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<Subheading>Our Values</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						What drives us every day
					</Heading>
				</AnimatedSection>

				<div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
					<AnimatedSection animation='fade-up' delay={100}>
						<ValueCard
							icon={<Code2 className='h-6 w-6' />}
							title='Open Source'
							description='No black boxes. See exactly how everything works, contribute features, or self-host if you prefer.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<ValueCard
							icon={<Heart className='h-6 w-6' />}
							title='Artist First'
							description="Every decision starts with 'how does this help musicians?' Not investors, not us - artists."
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={300}>
						<ValueCard
							icon={<Zap className='h-6 w-6' />}
							title='Integration'
							description='Your tools should work together. See which campaigns drive real results across all channels.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={400}>
						<ValueCard
							icon={<Users className='h-6 w-6' />}
							title='Community'
							description='Built with feedback from real musicians. Your needs drive our roadmap, not venture capital.'
						/>
					</AnimatedSection>
				</div>
			</Container>
		</section>
	);
}

function BarelyParrowConnection() {
	return (
		<section className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mx-auto max-w-4xl'>
					<div className='glass rounded-2xl p-12 text-center'>
						<Subheading>The Barely Connection</Subheading>
						<Heading as='h2' className='mb-6 mt-2 text-white'>
							Battle-tested in the real world
						</Heading>
						<p className='mb-8 text-lg text-muted-foreground'>
							barely.io powers all marketing campaigns at Barely NYC, our music marketing
							agency. We've used these exact tools to help indie artists grow from 0 to
							30K+ monthly listeners.
						</p>
						<p className='mb-8 text-lg text-muted-foreground'>
							Every feature was built to solve real problems we encountered working with
							artists. No theoretical features - just practical tools that get results.
						</p>
						<MarketingButton href='https://barely.nyc' variant='hero-secondary'>
							Learn about Barely
						</MarketingButton>
					</div>
				</AnimatedSection>
			</Container>
		</section>
	);
}

function Stats() {
	return (
		<section className='bg-card py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<Subheading>By the Numbers</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						Growing with our community
					</Heading>
				</AnimatedSection>

				<div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
					<AnimatedSection animation='fade-up' delay={100}>
						<div className='text-center'>
							<div className='mb-2 text-5xl font-bold text-white'>5,000+</div>
							<p className='text-muted-foreground'>Artists using barely.io</p>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='text-center'>
							<div className='mb-2 text-5xl font-bold text-white'>$2M+</div>
							<p className='text-muted-foreground'>Saved in tool costs</p>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={300}>
						<div className='text-center'>
							<div className='mb-2 text-5xl font-bold text-white'>100%</div>
							<p className='text-muted-foreground'>Open source</p>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={400}>
						<div className='text-center'>
							<div className='mb-2 text-5xl font-bold text-white'>24/7</div>
							<p className='text-muted-foreground'>Community support</p>
						</div>
					</AnimatedSection>
				</div>
			</Container>
		</section>
	);
}

function OpenSourceCommitment() {
	return (
		<section className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mx-auto max-w-4xl text-center'>
					<Subheading>Open Source Commitment</Subheading>
					<Heading as='h2' className='mb-6 mt-2 text-white'>
						Transparency is not just a feature
					</Heading>
					<p className='mb-8 text-lg text-muted-foreground'>
						Unlike other platforms, barely.io is fully open source. You can see exactly
						how everything works, contribute features, or even self-host if you prefer. No
						black boxes, no vendor lock-in, no surprises.
					</p>
					<div className='flex flex-col justify-center gap-4 sm:flex-row'>
						<MarketingButton
							href='https://github.com/barelylabs/barely'
							variant='hero-primary'
						>
							View on GitHub
						</MarketingButton>
						<MarketingButton href='/docs/self-hosting' variant='hero-secondary'>
							Self-Hosting Guide
						</MarketingButton>
					</div>
				</AnimatedSection>
			</Container>
		</section>
	);
}

function JoinUs() {
	return (
		<section className='bg-card py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mx-auto max-w-4xl text-center'>
					<Heading as='h2' className='mb-6 text-white'>
						Ready to take control of your{' '}
						<span className='gradient-text'>music marketing?</span>
					</Heading>
					<p className='mb-8 text-lg text-muted-foreground'>
						Join thousands of artists who've ditched expensive, fragmented tools for an
						integrated platform that actually makes sense.
					</p>
					<MarketingButton href='/sign-up' variant='hero-primary' glow>
						Start Building Free
					</MarketingButton>
				</AnimatedSection>
			</Container>
		</section>
	);
}

export default function Company() {
	return (
		<main className='overflow-hidden'>
			<Header />
			<Story />
			<Values />
			<BarelyParrowConnection />
			<Stats />
			<OpenSourceCommitment />
			<JoinUs />
		</main>
	);
}
