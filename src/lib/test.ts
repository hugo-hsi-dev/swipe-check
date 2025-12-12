import { query } from '$app/server';
import z from 'zod';

const schema = z
	.custom<string & z.$brand<'id'>>()
	.transform((input) => input as string)
	.pipe(z.uuid().brand('id'));

export const exampleQuery = query(schema, (asdf) => {
	return asdf;
});
