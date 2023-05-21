'use client';

import { useState } from 'react';

import { Button } from '@barely/ui/elements/button';
import { H4, HHero, Lead, Text, Title } from '@barely/ui/elements/typography';

const Hero = () => {
	const [showEmailForm, setShowEmailForm] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	return (
		<div
			id='hero'
			className='flex w-full flex-col space-y-4 bg-slate-900 px-6 pt-10 pb-20 text-left sm:px-4 sm:text-center md:items-center md:px-8'
		>
			<div className='max-w-5xl py-6 '>
				<HHero className='text-blue-500'>
					barely
					<span className='text-3xl text-gray-200 tracking-normal'>.link</span>
				</HHero>
				<Title className='text-5xl font-bold text-gray-100'>Links for Artists</Title>
				<Lead className='pt-10 pb-12'>
					Simple, powerful links to build your audience.
				</Lead>

				{!showEmailForm && !submitted && (
					<Button
						variant='primary'
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
