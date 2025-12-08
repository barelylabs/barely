import Link from 'next/link';

import { AnimatedSection } from './animated-section';

export function Footer() {
	return (
		<footer className='border-t border-white/10 bg-black/50 backdrop-blur-sm'>
			<div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
				<AnimatedSection animation='fade-up'>
					<div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
						{/* Brand Column */}
						<div className='col-span-1 md:col-span-2'>
							<div className='mb-4'>
								<Link href='/' className='text-2xl font-bold'>
									Barely NYC
								</Link>
							</div>
							<p className='mb-4 text-sm text-white/70'>
								Brooklyn-based marketing engineers for independent artists worldwide. We
								build data-driven growth systems that actually work.
							</p>
							<div className='flex items-center gap-2 text-sm text-white/50'>
								<svg
									className='h-4 w-4'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
									/>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
									/>
								</svg>
								Brooklyn, NY
							</div>
						</div>

						{/* Services Column */}
						<div>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wider text-white/50'>
								Services
							</h3>
							<ul className='space-y-2'>
								<li>
									<Link
										href='/services/bedroom'
										className='text-sm text-white/70 transition-colors hover:text-white'
									>
										Bedroom+ Coaching
									</Link>
								</li>
								<li>
									<Link
										href='/services/rising'
										className='text-sm text-white/70 transition-colors hover:text-white'
									>
										Rising+ Management
									</Link>
								</li>
								<li>
									<Link
										href='/services/breakout'
										className='text-sm text-white/70 transition-colors hover:text-white'
									>
										Breakout+ Growth Team
									</Link>
								</li>
							</ul>
						</div>

						{/* Company Column */}
						<div>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wider text-white/50'>
								Company
							</h3>
							<ul className='space-y-2'>
								<li>
									<Link
										href='/about'
										className='text-sm text-white/70 transition-colors hover:text-white'
									>
										About
									</Link>
								</li>
								<li>
									<Link
										href='/case-studies'
										className='text-sm text-white/70 transition-colors hover:text-white'
									>
										Case Studies
									</Link>
								</li>
								<li>
									<Link
										href='/blog'
										className='text-sm text-white/70 transition-colors hover:text-white'
									>
										Blog
									</Link>
								</li>
								<li>
									<a
										href='https://barely.ai'
										target='_blank'
										rel='noopener noreferrer'
										className='text-sm text-white/70 transition-colors hover:text-white'
									>
										barely.ai Platform
									</a>
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom Bar */}
					<div className='mt-12 border-t border-white/10 pt-8'>
						<div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
							<p className='text-sm text-white/50'>
								© {new Date().getFullYear()} Barely. All rights reserved.
							</p>
							<div className='flex gap-6'>
								<Link
									href='/privacy'
									className='text-sm text-white/50 transition-colors hover:text-white/70'
								>
									Privacy
								</Link>
								<Link
									href='/terms'
									className='text-sm text-white/50 transition-colors hover:text-white/70'
								>
									Terms
								</Link>
							</div>
						</div>
					</div>
				</AnimatedSection>
			</div>
		</footer>
	);
}
