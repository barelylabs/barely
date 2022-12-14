import { router } from '../trpc';

// import routes
import { authRouter } from './auth';
import { bioRouter } from './bio';
import { eventRouter } from './event';
import { formResponseRouter } from './formResponse';
import { linkRouter } from './link';
import { visitorSessionRouter } from './visitorSession';

// export routes
export const appRouter = router({
	auth: authRouter,
	bio: bioRouter,
	formResponse: formResponseRouter,
	link: linkRouter,
	event: eventRouter,
	visitorSession: visitorSessionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
