import { query, form, command } from '$app/server';
import { z } from 'zod';

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
const getRecordSchema = z.object({
	id: z.string()
});

export const getRecord = query(getRecordSchema, async ({ id }) => {
	// Simulate async database call
	await new Promise((resolve) => setTimeout(resolve, 100));

	return {
		id,
		data: `Record ${id}`,
		fetchedAt: new Date().toISOString()
	};
});

/**
 * Query function - process data on server
 */
const processTextSchema = z.object({
	text: z.string()
});

export const processText = query(processTextSchema, async ({ text }) => {
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
const submitDataSchema = z.object({
	text: z.string().min(1, 'Text field is required')
});

export const submitData = form(submitDataSchema, async (data) => {
	// Process the data
	const result = {
		original: data.text,
		processed: data.text.toUpperCase(),
		length: data.text.length,
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
const logActivitySchema = z.object({
	activity: z.string()
});

export const logActivity = command(logActivitySchema, async ({ activity }) => {
	console.log(`Activity logged at ${new Date().toISOString()}: ${activity}`);
	// Commands don't return values
});
