import { OPTIONS } from '@barely/utils';
import { landingPageRenderHandler } from '@barely/api/public/landing-page-render.handler';

const handler = landingPageRenderHandler;

export { OPTIONS, handler as GET, handler as POST };
