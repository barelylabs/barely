import { z } from 'zod';

const teamSchema = z.object({
	id: z.string(),
	name: z.string(),
	handle: z.string(),
	spotifyArtistId: z.string().nullish(),
});

export { teamSchema };
