import { router } from "../trpc";

// import routes
import { accountRouter } from "./account";
import { artistRouter } from "./artist";
import { authRouter } from "./auth";
import { bioRouter } from "./bio";
import { eventRouter } from "./event";
import { formResponseRouter } from "./formResponse";
import { linkRouter } from "./link";
import { spotifyRouter} from "./spotify";
import { visitorSessionRouter } from "./visitorSession";

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
