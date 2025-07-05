import { OPTIONS } from '@barely/utils';
import { emailManageHandler } from '@barely/api/public/email-manage.handler';

const handler = emailManageHandler;

export { OPTIONS, handler as GET, handler as POST };
