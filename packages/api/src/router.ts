import { router } from './trpc';

// import routes
import { accountRouter } from './routes/account';
import { artistRouter } from './routes/artist';
import { authRouter } from './routes/auth';
import { bioRouter } from './routes/bio';
import { eventRouter } from './routes/event';
import { formResponseRouter } from './routes/formResponse';
import { linkRouter } from './routes/link';
import { spotifyRouter } from './routes/spotify';
import { visitorSessionRouter } from './routes/visitorSession';

// export routes
export const appRouter = router({
	account: accountRouter,
	artist: artistRouter,
	auth: authRouter,
	bio: bioRouter,
	formResponse: formResponseRouter,
	link: linkRouter,
	event: eventRouter,
	spotify: spotifyRouter,
	visitorSession: visitorSessionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
