'use client';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../../components/marketing/animated-section';
import { MarketingButton } from '../../../components/marketing/button';

export function FulfilledContent() {
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
							We Ship Your Merch So You Can Make Music
						</H>
						<p className='mb-8 text-lg text-white/70 md:text-xl'>
							Send us your inventory — vinyl, CDs, apparel, accessories — and we handle
							pick, pack, and ship from Brooklyn. Every order fulfilled within 1-2
							business days.
						</p>
						<div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
							<a href='mailto:adam@barely.nyc?subject=Barely%20Fulfilled%20Inquiry'>
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

			{/* How It Works */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-6xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							How It Works
						</H>
					</AnimatedSection>

					<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
						<AnimatedSection animation='fade-up' delay={200}>
							<div className='glass rounded-xl p-6'>
								<div className='mb-4 text-3xl font-bold text-purple-300'>1</div>
								<H size='5' className='mb-2'>
									Send Us Your Inventory
								</H>
								<p className='text-white/70'>
									Ship your merch to our Brooklyn location. We count, log, and shelve
									everything into your barely.cart inventory.
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<div className='glass rounded-xl p-6'>
								<div className='mb-4 text-3xl font-bold text-purple-300'>2</div>
								<H size='5' className='mb-2'>
									Connect Your Storefront
								</H>
								<p className='text-white/70'>
									Barely Fulfilled is integrated directly into barely.cart. Your orders
									flow in automatically — no manual syncing, no third-party connections to
									manage.
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<div className='glass rounded-xl p-6'>
								<div className='mb-4 text-3xl font-bold text-purple-300'>3</div>
								<H size='5' className='mb-2'>
									We Ship Your Orders
								</H>
								<p className='text-white/70'>
									Orders are picked, packed, and shipped within 1-2 business days. You get
									tracking and inventory updates in real time.
								</p>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* What's Included */}
			<section className='px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							What&apos;s Included
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass rounded-xl p-8'>
							<ul className='space-y-3'>
								{[
									'Inventory receiving & intake',
									'Climate-appropriate storage (vinyl-safe)',
									'Pick & pack with proper packaging (LP mailers, poly bags, rigid CD mailers)',
									'Shipping via USPS Media Mail, First Class, or Priority (optimized per item)',
									'Returns processing',
									'Real-time inventory tracking in barely.cart',
									'Automatic order flow from barely.cart (no manual syncing)',
									'Daily carrier pickups from our Brooklyn facility',
								].map((feature, i) => (
									<li key={i} className='flex items-start gap-3'>
										<span className='mt-0.5 text-green-500'>✓</span>
										<span className='text-white/80'>{feature}</span>
									</li>
								))}
							</ul>
						</div>
					</AnimatedSection>
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
							No monthly minimums. No setup fees. No minimum order volume. Pay per order
							fulfilled.
						</p>
					</AnimatedSection>

					{/* Order Handling */}
					<AnimatedSection animation='fade-up' delay={200}>
						<div className='mb-8'>
							<H size='4' className='mb-4 text-purple-300'>
								Order Handling
							</H>
							<div className='glass overflow-hidden rounded-xl'>
								<table className='w-full'>
									<thead>
										<tr className='border-b border-white/10'>
											<th className='px-6 py-3 text-left text-sm font-medium text-white/60'>
												Fee
											</th>
											<th className='px-6 py-3 text-right text-sm font-medium text-white/60'>
												Rate
											</th>
										</tr>
									</thead>
									<tbody>
										<tr className='border-b border-white/5'>
											<td className='px-6 py-4 text-white/80'>
												Handling fee (per order)
											</td>
											<td className='px-6 py-4 text-right font-medium text-white'>
												$2.50
											</td>
										</tr>
										<tr>
											<td className='px-6 py-4 text-white/80'>
												Pick fee (additional items)
											</td>
											<td className='px-6 py-4 text-right font-medium text-white'>
												$0.25 / item
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</AnimatedSection>

					{/* Packaging */}
					<AnimatedSection animation='fade-up' delay={300}>
						<div className='mb-8'>
							<H size='4' className='mb-2 text-purple-300'>
								Packaging
							</H>
							<p className='mb-4 text-sm text-white/60'>
								One packaging fee per order based on the mailer type used. If an order has
								multiple item types, the fee is based on whichever mailer is needed.
							</p>
							<div className='glass overflow-hidden rounded-xl'>
								<table className='w-full'>
									<thead>
										<tr className='border-b border-white/10'>
											<th className='px-6 py-3 text-left text-sm font-medium text-white/60'>
												Mailer Type
											</th>
											<th className='px-6 py-3 text-right text-sm font-medium text-white/60'>
												Fee
											</th>
										</tr>
									</thead>
									<tbody>
										{[
											['CD / Cassette mailer', '$0.50'],
											['Poly bag (apparel)', '$0.50'],
											['Poster tube / rigid flat mailer', '$1.00'],
											['LP mailer (single)', '$2.00'],
											['LP mailer (double / gatefold)', '$2.50'],
										].map(([type, fee], i) => (
											<tr key={i} className={i < 4 ? 'border-b border-white/5' : ''}>
												<td className='px-6 py-4 text-white/80'>{type}</td>
												<td className='px-6 py-4 text-right font-medium text-white'>
													{fee}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</AnimatedSection>

					{/* Storage & Inventory */}
					<AnimatedSection animation='fade-up' delay={400}>
						<div className='mb-8'>
							<H size='4' className='mb-4 text-purple-300'>
								Storage & Inventory
							</H>
							<div className='glass overflow-hidden rounded-xl'>
								<table className='w-full'>
									<thead>
										<tr className='border-b border-white/10'>
											<th className='px-6 py-3 text-left text-sm font-medium text-white/60'>
												Fee
											</th>
											<th className='px-6 py-3 text-right text-sm font-medium text-white/60'>
												Rate
											</th>
										</tr>
									</thead>
									<tbody>
										{[
											['Storage (per bin / month)', '$3.00'],
											['Storage (per pallet / month)', '$40.00'],
											['Inventory receiving', '$40.00 / hour'],
											['Returns processing', '$3.00 / return'],
										].map(([fee, rate], i) => (
											<tr key={i} className={i < 3 ? 'border-b border-white/5' : ''}>
												<td className='px-6 py-4 text-white/80'>{fee}</td>
												<td className='px-6 py-4 text-right font-medium text-white'>
													{rate}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</AnimatedSection>

					{/* Callout Box */}
					<AnimatedSection animation='fade-up' delay={500}>
						<div className='rounded-xl border-l-4 border-purple-500 bg-purple-500/10 p-6'>
							<H size='5' className='mb-2'>
								Pass it through or absorb it — your choice.
							</H>
							<p className='text-white/80'>
								In barely.cart, you can toggle packaging and pick fees on or off at
								checkout. When enabled, they&apos;re bundled into the &quot;shipping &
								handling&quot; total your customer sees — invisible as a separate line
								item. Your effective cost drops to just the $2.50 handling fee per order.
							</p>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* Example Orders */}
			<section className='px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							Example Orders
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass overflow-hidden rounded-xl'>
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b border-white/10'>
											<th className='px-6 py-3 text-left text-sm font-medium text-white/60'>
												Order
											</th>
											<th className='px-6 py-3 text-right text-sm font-medium text-white/60'>
												Handling
											</th>
											<th className='px-6 py-3 text-right text-sm font-medium text-white/60'>
												Packaging
											</th>
											<th className='px-6 py-3 text-right text-sm font-medium text-white/60'>
												Pick Fees
											</th>
											<th className='px-6 py-3 text-right text-sm font-medium text-white/60'>
												Total
											</th>
										</tr>
									</thead>
									<tbody>
										{[
											['1 CD', '$2.50', '$0.50', '—', '$3.00'],
											['1 CD + sticker pack', '$2.50', '$0.50', '$0.25', '$3.25'],
											['1 t-shirt', '$2.50', '$0.50', '—', '$3.00'],
											['1 vinyl LP', '$2.50', '$2.00', '—', '$4.50'],
											[
												'1 vinyl LP + t-shirt + stickers',
												'$2.50',
												'$2.00',
												'$0.50',
												'$5.00',
											],
											['1 CD + t-shirt', '$2.50', '$0.50', '$0.25', '$3.25'],
										].map(([order, handling, packaging, pick, total], i) => (
											<tr key={i} className={i < 5 ? 'border-b border-white/5' : ''}>
												<td className='px-6 py-4 text-white/80'>{order}</td>
												<td className='px-6 py-4 text-right text-white/70'>{handling}</td>
												<td className='px-6 py-4 text-right text-white/70'>
													{packaging}
												</td>
												<td className='px-6 py-4 text-right text-white/70'>{pick}</td>
												<td className='px-6 py-4 text-right font-medium text-white'>
													{total}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* How Shipping Works */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-8 text-center text-3xl md:text-4xl'>
							How Shipping Works
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='space-y-6'>
							<p className='text-lg leading-relaxed text-white/80'>
								When a customer places an order through barely.cart, shipping costs are
								calculated and collected at checkout. Those funds are held until the order
								is fulfilled. We use those collected funds to purchase the actual shipping
								label — you never need to front carrier costs.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								We optimize shipping method based on item type. Vinyl records and CDs ship
								via USPS Media Mail when eligible ($3-5 for a single domestic LP). Apparel
								and non-media items ship via the most cost-effective service (USPS First
								Class, Ground Advantage, or Priority depending on weight).
							</p>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* FAQ Section */}
			<section className='px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							Common Questions
						</H>
					</AnimatedSection>

					<div className='space-y-6'>
						{[
							{
								q: 'Is there a monthly minimum or contract?',
								a: 'No. You pay only for what we fulfill. No minimums, no long-term commitment.',
							},
							{
								q: 'Can you handle vinyl records safely?',
								a: 'Yes. We use industry-standard LP mailers with corner protection and ship via USPS Media Mail. Vinyl is stored in climate-appropriate conditions.',
							},
							{
								q: 'Do I need to use barely.cart?',
								a: 'Yes — during the pilot program, Barely Fulfilled is exclusively available to barely.cart users. The integration is built directly into the platform: automatic order flow, dynamic packaging fee calculation at checkout, and the option to pass handling costs through to customers. Support for external platforms (Shopify, Bandcamp, etc.) is on the roadmap.',
							},
							{
								q: 'What does "handling pass-through" mean?',
								a: 'In barely.cart, you can enable a toggle that automatically adds the packaging and pick fees to the "shipping & handling" total your customer sees at checkout. This means your customer covers the cost of shipping materials and picking. You can turn this off if you prefer to absorb those costs.',
							},
							{
								q: 'Where are you located?',
								a: 'Brooklyn, NY. Local artists can drop off inventory in person.',
							},
							{
								q: 'How do I track my inventory and orders?',
								a: 'Everything is visible in your barely.cart dashboard — stock levels, order status, and order history.',
							},
						].map((faq, i) => (
							<AnimatedSection key={i} animation='fade-up' delay={200 + i * 100}>
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
							Ready to stop packing boxes?
						</H>
						<div className='mb-6'>
							<a href='mailto:adam@barely.nyc?subject=Barely%20Fulfilled%20Inquiry'>
								<MarketingButton marketingLook='hero-primary' size='lg'>
									Get Started
								</MarketingButton>
							</a>
						</div>
						<p className='text-white/60'>
							Or email{' '}
							<a
								href='mailto:adam@barely.nyc'
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
