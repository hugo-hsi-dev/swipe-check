import { query } from '$app/server';
import getUserHandler from './getUser.handler';

export const getUser = query(getUserHandler);
