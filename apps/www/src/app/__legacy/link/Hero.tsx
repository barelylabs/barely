'use client';

import { useState } from 'react';

import { Button } from '@barely/ui/elements/button';
import { H, Lead } from '@barely/ui/elements/typography';

const Hero = () => {
	const [showEmailForm] = useState(false);
	const [submitted] = useState(false);

	return (
		<div
			id='hero'
			className='flex w-full flex-col space-y-4 bg-slate-900 px-6 pb-20 pt-10 text-left sm:px-4 sm:text-center md:items-center md:px-8'
		>
			<div className='max-w-5xl py-6 '>
				<H size='1' className='text-blue-500'>
					barely
					<span className='text-3xl tracking-normal text-gray-200'>.link</span>
				</H>
				<H size='1' className='text-5xl font-bold text-gray-100'>
					Links for Artists
				</H>
				<Lead className='pb-12 pt-10'>
					Simple, powerful links to build your audience.
				</Lead>

				{!showEmailForm && !submitted && (
					<Button
						look='primary'
						size='lg'
						pill
						// onClick={() => setShowEmailForm(true)}
					>
						Join the waitlist
					</Button>
				)}

				{/* {showEmailForm && (
					<form
						className='flex flex-row justify-center space-x-3 sm:mx-auto'
						onSubmit={() => {
							event?.preventDefault();
							setShowEmailForm(false);
							setSubmitted(true);
						}}
					>
						<input className='rounded-xl px-5 py-3' placeholder='email address'></input>
						<Button
							id='submit'
							variant='subtle'
							// className='rounded-xl bg-purple-500 px-5 py-3 font-normal text-gray-50'
						>
							Submit
						</Button>
					</form>
				)} */}

				{submitted && (
					<div className='mx-auto max-w-sm text-purple-200 '>
						<p className='font-semibold'>Thanks for your interest!</p>
						<p>
							{`You've been added to our waitlist and we'll reach out when we expand our
							testing program.`}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Hero;
