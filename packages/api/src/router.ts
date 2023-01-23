import { router } from './trpc';

// import routes
import { accountRouter } from './routes/account';
import { artistRouter } from './routes/artist';
import { authRouter } from './routes/auth';
import { bioRouter } from './routes/bio';
import { campaignRouter } from './routes/campaign';
import { eventRouter } from './routes/event';
import { formResponseRouter } from './routes/formResponse';
import { linkRouter } from './routes/link';
import { aiRouter } from './routes/ai';
import { spotifyRouter } from './routes/spotify';
import { trackRouter } from './routes/track';
import { visitorSessionRouter } from './routes/visitorSession';

// export routes
export const appRouter = router({
	account: accountRouter,
	ai: aiRouter,
	artist: artistRouter,
	auth: authRouter,
	bio: bioRouter,
	campaign: campaignRouter,
	event: eventRouter,
	formResponse: formResponseRouter,
	link: linkRouter,
	spotify: spotifyRouter,
	track: trackRouter,
	visitorSession: visitorSessionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
