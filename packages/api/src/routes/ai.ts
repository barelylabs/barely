import { z } from 'zod';
import { router, privateProcedure } from '../trpc';
import { Configuration, OpenAIApi } from 'openai';
import { TRPCError } from '@trpc/server';

import env from '../env';

const configuration = new Configuration({
	organization: env.OPENAI_ORG_ID,
	apiKey: env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const aiRouter = router({
	sendPrompt: privateProcedure
		.input(z.object({ prompt: z.string().min(1) }))
		.mutation(async ({ ctx, input: { prompt } }) => {
			try {
				console.log('openai prompt => ', prompt);

				const response = await openai.createCompletion({
					model: 'text-davinci-003',
					prompt,
					max_tokens: 7,
					temperature: 0,
				});

				console.log('openai response => ', response.data);

				const generatedText = response.data.choices[0]?.text;
				console.log('gpt response => ', generatedText);

				return { message: generatedText };
				// return { message: 'test' };
			} catch (error) {
				console.error('gpt error => ', error);

				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Something went wrong.',
					cause: error,
				});
			}
		}),
});
