import { OPTIONS } from '@barely/utils';

import { cartHandler } from '@barely/api/public/cart.handler';

const handler = cartHandler;

export { OPTIONS, handler as GET, handler as POST };
