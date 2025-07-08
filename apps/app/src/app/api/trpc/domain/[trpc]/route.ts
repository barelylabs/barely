import { OPTIONS } from '@barely/utils';

import { webDomainHandler } from '@barely/api/app/sub/web-domain.handler';

// Note: This file exists to satisfy Next.js type generation.
// The actual domain functionality is split into web-domain and email-domain handlers.
export { OPTIONS, webDomainHandler as GET, webDomainHandler as POST };
