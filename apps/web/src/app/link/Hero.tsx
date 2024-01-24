'use client';

import { useState } from 'react';

const Hero = () => {
	const [showEmailForm, setShowEmailForm] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	return (
		<div
			id='hero'
			className='flex w-full flex-col space-y-4 bg-gradient-to-b from-purple-900 to-purple-600  px-6 pt-10 pb-28 text-left sm:px-4 sm:text-center md:items-center md:px-8'
		>
			<div className='max-w-5xl py-6 '>
				<h1 className='animate-text bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-8xl font-extrabold leading-relaxed  text-transparent'>
					barely
					<span className='text-3xl text-gray-200'>.link</span>
				</h1>
				<h1 className='text-5xl font-bold text-gray-100'>Links for Artists</h1>
				<p className='w-full pt-10 pb-12  text-xl text-gray-200  '>
					Simple, powerful links to build your audience.
				</p>

				{!showEmailForm && !submitted && (
					<button
						onClick={() => setShowEmailForm(true)}
						className='rounded-xl bg-purple-400 px-5 py-3 font-normal text-gray-50'
					>
						Join the waitlist
					</button>
				)}

				{showEmailForm && (
					<form
						className='flex flex-row justify-center space-x-3 sm:mx-auto'
						onSubmit={() => {
							event?.preventDefault();
							setShowEmailForm(false);
							setSubmitted(true);
						}}
					>
						<input className='rounded-xl px-5 py-3' placeholder='email address'></input>
						<button
							id='submit'
							className='rounded-xl bg-purple-500 px-5 py-3 font-normal text-gray-50'
						>
							Submit
						</button>
					</form>
				)}

				{submitted && (
					<div className='mx-auto max-w-sm text-purple-200 '>
						<p className='font-semibold'>Thanks for your interest!</p>
						<p>
							You've been added to our waitlist and we'll reach out when we expand our
							testing program.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Hero;
