import Link from 'next/link';
import { getAbsoluteUrl } from '@barely/utils';

import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

import { Container } from '../shared/container';

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className='border-t bg-muted/30'>
			<Container>
				<div className='py-12'>
					<div className='grid gap-8 md:grid-cols-4'>
						{/* Product */}
						<div>
							<h4 className='mb-4 font-semibold'>Product</h4>
							<ul className='space-y-2'>
								<li>
									<Link
										href='#features'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										Features
									</Link>
								</li>
								<li>
									<Link
										href='#pricing'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										Pricing
									</Link>
								</li>
								<li>
									<Link
										href='#'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										Roadmap
									</Link>
								</li>
								<li>
									<Link
										href='#'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										Status
									</Link>
								</li>
							</ul>
						</div>

						{/* Company */}
						<div>
							<h4 className='mb-4 font-semibold'>Company</h4>
							<ul className='space-y-2'>
								<li>
									<Link
										href='#'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										About
									</Link>
								</li>
								<li>
									<Link
										href={getAbsoluteUrl('www')}
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										Barely.io
									</Link>
								</li>
								<li>
									<Link
										href='https://twitter.com/barelyai'
										className='text-sm text-muted-foreground hover:text-foreground'
										target='_blank'
										rel='noopener noreferrer'
									>
										Twitter
									</Link>
								</li>
								<li>
									<Link
										href='#'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										Contact
									</Link>
								</li>
							</ul>
						</div>

						{/* Resources */}
						<div>
							<h4 className='mb-4 font-semibold'>Resources</h4>
							<ul className='space-y-2'>
								<li>
									<Link
										href='#'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										Blog
									</Link>
								</li>
								<li>
									<Link
										href='#'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										Help Center
									</Link>
								</li>
								<li>
									<Link
										href='#'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										API Docs
									</Link>
								</li>
								<li>
									<Link
										href='#'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										Templates
									</Link>
								</li>
							</ul>
						</div>

						{/* Legal */}
						<div>
							<h4 className='mb-4 font-semibold'>Legal</h4>
							<ul className='space-y-2'>
								<li>
									<Link
										href='#'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										Terms
									</Link>
								</li>
								<li>
									<Link
										href='#'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										Privacy
									</Link>
								</li>
								<li>
									<Link
										href='#'
										className='text-sm text-muted-foreground hover:text-foreground'
									>
										DPA
									</Link>
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom section */}
					<div className='mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row'>
						<div className='flex items-center gap-2'>
							<Icon.receipt className='h-5 w-5 text-primary' />
							<Text variant='sm/normal' className='text-muted-foreground'>
								© {currentYear} Barely Invoice • Part of the Barely family • Made with ❤️
								for freelancers
							</Text>
						</div>
					</div>
				</div>
			</Container>
		</footer>
	);
}
