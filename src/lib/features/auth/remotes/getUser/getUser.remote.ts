import { query } from '$app/server';
import getUserHandler from './getUser';

export const getUser = query(getUserHandler);
