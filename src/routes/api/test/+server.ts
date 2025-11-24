import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	return new Response(JSON.stringify({ number: 42 }), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
