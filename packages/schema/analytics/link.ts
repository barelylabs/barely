import { z } from 'zod';
import { visitorSessionCreateSchema } from '../db/visitorsession';

export const linkAnalyticsSchema = visitorSessionCreateSchema.merge(
	z.object({ linkId: z.string(), teamId: z.string(), url: z.string() }),
);
