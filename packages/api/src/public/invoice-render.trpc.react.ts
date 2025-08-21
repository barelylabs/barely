import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { InvoiceRenderRouter } from './invoice-render.router';

export const {
	TRPCProvider: InvoiceRenderTRPCProvider,
	useTRPC: useInvoiceRenderTRPC,
	useTRPCClient: useInvoiceRenderTRPCClient,
} = createTRPCContext<InvoiceRenderRouter>();
