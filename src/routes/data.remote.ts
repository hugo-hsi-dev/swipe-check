import { query, form, command } from '$app/server';

/**
 * Query function - fetch server data
 * This runs on the server and automatically handles client/server execution
 */
export const getServerData = query(async () => {
	return {
		timestamp: new Date().toISOString(),
		environment: 'server',
		message: 'This data was fetched from the server using remote functions'
	};
});

/**
 * Query function with parameters - fetch data by ID
 */
export const getRecord = query(async (id: string) => {
	// Simulate async database call
	await new Promise(resolve => setTimeout(resolve, 100));

	return {
		id,
		data: `Record ${id}`,
		fetchedAt: new Date().toISOString()
	};
});

/**
 * Query function - process data on server
 */
export const processText = query(async (text: string) => {
	return {
		original: text,
		processed: text.toUpperCase(),
		length: text.length,
		reversed: text.split('').reverse().join('')
	};
});

/**
 * Form function - handle form submissions with progressive enhancement
 */
export const submitData = form(async (data: FormData) => {
	const text = data.get('text') as string;

	if (!text || text.trim().length === 0) {
		return {
			success: false,
			error: 'Text field is required'
		};
	}

	// Process the data
	const result = {
		original: text,
		processed: text.toUpperCase(),
		length: text.length,
		submittedAt: new Date().toISOString()
	};

	return {
		success: true,
		result
	};
});

/**
 * Command function - for actions that don't return data
 */
export const logActivity = command(async (activity: string) => {
	console.log(`Activity logged at ${new Date().toISOString()}: ${activity}`);
	// Commands don't return values
});
