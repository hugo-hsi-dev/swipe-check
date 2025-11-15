import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchFromDatabase } from '$lib/server';

/**
 * GET endpoint with URL parameters
 * Example: /api/records/123
 */
export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	const record = await fetchFromDatabase(id);

	return json({
		success: true,
		record
	});
};
