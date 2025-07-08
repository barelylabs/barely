import { z } from 'zod/v4';

export const dateRange = z.enum(['1d', '1w', '28d', '1y']);
export type DateRange = z.infer<typeof dateRange>;
