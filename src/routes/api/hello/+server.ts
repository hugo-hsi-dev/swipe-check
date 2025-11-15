import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET endpoint - Simple hello world API
 */
export const GET: RequestHandler = async () => {
	return json({
		message: 'Hello from the server!',
		timestamp: new Date().toISOString()
	});
};
