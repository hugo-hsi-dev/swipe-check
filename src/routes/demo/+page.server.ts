import type { PageServerLoad } from './$types';
import { getServerData, fetchFromDatabase } from '$lib/server';

/**
 * Server-side load function
 * This runs on the server before the page is rendered
 */
export const load: PageServerLoad = async () => {
	// Fetch data using server-only functions
	const serverData = await getServerData();
	const record = await fetchFromDatabase('demo-123');

	return {
		serverData,
		record,
		loadedAt: new Date().toISOString()
	};
};
