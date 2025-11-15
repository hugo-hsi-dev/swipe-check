import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getServerData, processData } from '$lib/server';

/**
 * GET endpoint - Fetch data using server-side functions
 */
export const GET: RequestHandler = async () => {
	const data = await getServerData();

	return json({
		success: true,
		data
	});
};

/**
 * POST endpoint - Process data on the server
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { text } = body;

	if (!text || typeof text !== 'string') {
		return json(
			{
				success: false,
				error: 'Text field is required and must be a string'
			},
			{ status: 400 }
		);
	}

	const result = processData(text);

	return json({
		success: true,
		result
	});
};
