import { OPTIONS } from '@barely/utils';

import { invoiceRenderHandler } from '@barely/api/public/invoice-render.handler';

const handler = invoiceRenderHandler;

export { OPTIONS, handler as GET, handler as POST };
