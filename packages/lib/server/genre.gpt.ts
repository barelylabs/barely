import { ChatOpenAI } from '@langchain/openai';
import { OutputFixingParser, StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from 'langchain/prompts';
import { z } from 'zod';

import { Genre, insertGenreSchema } from './genre.schema';

export async function estimateGenresByTracks(
	tracks: {
		track: string;
		artist: string;
	}[],
) {
	const gptGenresSchema = z.object({
		genres: z
			.array(insertGenreSchema.shape.id)
			.max(10)
			.describe(
				'An array of 5-10 genres that best fit the tracks included in the playlist',
			),
	});

	const parser = StructuredOutputParser.fromZodSchema(gptGenresSchema);

	const prompt = new PromptTemplate({
		template: `You are a sophisticated music critic that can identify the genres of a playlist. The user will enter a list of songs and artists. You will respond with the 5-10 genres that best fit that playlist. If there are less than 10 genres that fit the playlist, don't include more than you are sure about. \n{format_instructions}\n{inputTracks}`,
		inputVariables: ['inputTracks'],
		partialVariables: { format_instructions: parser.getFormatInstructions() },
	});

	const model = new ChatOpenAI({
		modelName: 'gpt-4',
		temperature: 0,
	});

	const input = await prompt.format({
		inputTracks: JSON.stringify(tracks),
	});

	const response = await model.invoke(input);
	let genreIds: string[] = [];

	try {
		// const responseString = await stringParser.parse(response.content);
		genreIds = (await parser.parse(response.text)).genres;
	} catch (e) {
		console.error('failed to parse bad output: ', e);

		const fixParser = OutputFixingParser.fromLLM(model, parser);
		genreIds = (await fixParser.parse(response.text)).genres;
	}

	return genreIds as Genre['id'][];
}
