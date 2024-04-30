import type { NextRequest } from 'next/server';
import { handleActionableWorkflowRuns } from '@barely/lib/server/routes/workflow-run/workflow-run.fns';

export async function POST(req: NextRequest) {
	const headers = req.headers;
	console.log(headers);
	// todo require auth header
	try {
		await handleActionableWorkflowRuns();
		return new Response(null, {
			statusText: 'OK',
			status: 200,
		});
	} catch (error) {
		console.error('err => ', error);
		return new Response(null, {
			statusText: 'Internal Server Error',
			status: 500,
		});
	}
}
