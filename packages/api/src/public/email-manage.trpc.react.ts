import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { EmailManageRouter } from './email-manage.router';

export const {
	TRPCProvider: EmailManageTRPCProvider,
	useTRPC: useEmailManageTRPC,
	useTRPCClient: useEmailManageTRPCClient,
} = createTRPCContext<EmailManageRouter>();
