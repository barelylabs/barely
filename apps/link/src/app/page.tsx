'use client';

import { TooltipProvider } from './Tooltip';
import Hero from './Hero';
import SupportedApps from './SupportedApps';
import BuildYourJourney from './BuildYourJourney';
import MadeForMarketing from './MadeForMarketing';
import Footer from './Footer';
import Header from './Header';

export default function HomePage() {
	return (
		<TooltipProvider>
			<div className='flex w-full flex-col place-items-center'>
				<Header />
				<Hero />
				<SupportedApps />
				<BuildYourJourney />
				<MadeForMarketing />

				<Footer />
			</div>
		</TooltipProvider>
	);
}
