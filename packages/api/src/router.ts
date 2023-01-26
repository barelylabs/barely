import { router } from './trpc';

// import routes
import { accountRouter } from './routes/account';

import { bioRouter } from './routes/bio';
import { campaignRouter } from './routes/campaign';

import { eventRouter } from './routes/event';
import { formResponseRouter } from './routes/formResponse';
import { linkRouter } from './routes/link';
import { aiRouter } from './routes/ai';
import { spotifyRouter } from './routes/spotify';

import { storyBoardRouter, storyColumnRouter, storyRouter } from './routes/story';

import { trackRouter } from './routes/track';
import { userRouter } from './routes/user';
import { visitorSessionRouter } from './routes/visitorSession';

// export routes
export const appRouter = router({
	account: accountRouter,
	ai: aiRouter,

	user: userRouter,
	bio: bioRouter,
	campaign: campaignRouter,
	event: eventRouter,
	formResponse: formResponseRouter,
	link: linkRouter,
	spotify: spotifyRouter,

	story: storyRouter,
	storyBoard: storyBoardRouter,
	storyColumn: storyColumnRouter,

	track: trackRouter,
	visitorSession: visitorSessionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
