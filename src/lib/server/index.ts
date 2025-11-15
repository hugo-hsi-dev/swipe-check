/**
 * Server-side utility functions
 * These functions can only be imported and executed on the server
 */

/**
 * Example server-only function to fetch data
 */
export async function getServerData() {
	return {
		timestamp: new Date().toISOString(),
		environment: 'server',
		message: 'This data was fetched from the server'
	};
}

/**
 * Example function to process data server-side
 */
export function processData(input: string): { processed: string; length: number } {
	return {
		processed: input.toUpperCase(),
		length: input.length
	};
}

/**
 * Example async server function that simulates a database call
 */
export async function fetchFromDatabase(id: string) {
	// Simulate async operation
	await new Promise(resolve => setTimeout(resolve, 100));

	return {
		id,
		data: `Record ${id}`,
		fetchedAt: new Date().toISOString()
	};
}
