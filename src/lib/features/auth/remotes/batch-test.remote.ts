import { query } from '$app/server';
import z from 'zod';

export const batchTestRemote = query.batch(z.string(), (items) => {
	const lookup = new Map(items.map((item) => [item, item]));

	return (item) => lookup.get(item);
});
