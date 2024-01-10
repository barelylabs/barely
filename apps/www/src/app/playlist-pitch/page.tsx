import { Hero } from "~/app/components/hero";
import {
  GetStartedToday,
  LetsGetStarted,
} from "~/app/playlist-pitch/get-started";
import { FAQ } from "./faq";
import { Features } from "./high-quality-campaigns";
import { HowItWorks } from "./how-it-works";
import { WhatYouGet } from "./what-you-get";

const PlaylistPitchPage = () => {
  return (
    <div className="flex w-full flex-col items-center">
      <Hero
        badgeIcon="spark"
        badgeLabel="Discover"
        title="playlist.pitch"
        subtitle="Get your music onto organic playlists and jump start your audience."
        buttonLabel="Start Campaign"
      />
      <Features />
      <WhatYouGet />
      <HowItWorks />
      <LetsGetStarted />
      <FAQ />
      <GetStartedToday />
    </div>
  );
};

// const faqItems: AccordionItemProps[] = [
// 	{
// 		trigger: 'How do I know if my track is a good fit?',
// 		content:
// 			'We will review your submission and let you know if we think it’s a good fit.',
// 		value: 'good-fit',
// 	},
// 	{
// 		trigger: 'How long do campaigns run?',
// 		content:
// 			'Campaigns run for 14 days. We will send you a report at the end of the campaign.',
// 		value: 'campaign-length',
// 	},
// 	{
// 		trigger: 'Are results guaranteed?',
// 		content:
// 			'You will always received feedback from curators. Since the playlists are organic and run by real curators, we do not offer any guarantees on the number of placements and/or streams you will receive.',
// 		value: 'results-guaranteed',
// 	},
// 	{
// 		trigger: 'What about fake playlists?',
// 		content: 'We only work with curators who are actively promoting their playlists.',
// 		value: 'fake-playlists',
// 	},
// 	{
// 		trigger: "What if I don't like the playlists I'm placed on?",
// 		content:
// 			"We work hard to match you with the right curators - if you get placed on one of their playlist, we expect you'll be happy with the placement. That said, you can always request to be removed from a playlist.",
// 		value: 'dont-like-playlists',
// 	},

// 	{
// 		trigger: 'What if I have more questions?',
// 		content: 'You can always reach out to us at support@barely.io',
// 		value: 'more-questions',
// 	},
// ];

// const FAQ = () => {
// 	return (
// 		<div className='flex flex-col space-y-3 mt-20 w-full'>
// 			<div className='max-w-2xl'>
// 				<H1 className='pb-4'>Frequently asked questions</H1>

// 				<Text variant='lg/light' muted>
// 					Find your answers to common playlist.pitch questions.
// 				</Text>
// 			</div>

// 			<Accordion items={faqItems} />
// 		</div>
// 	);
// };

export default PlaylistPitchPage;
