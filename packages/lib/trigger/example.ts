import { logger, task, wait } from '@trigger.dev/sdk/v3';

export const exampleTask = task({
	id: 'example-task',
	run: async (payload: { number: number }, { ctx }) => {
		logger.log('Creating some great graphs!', { payload, ctx });

		await wait.for({ seconds: 5 });

		logger.log('Graphs created!', { payload, ctx });

		return { success: true };
	},
});
