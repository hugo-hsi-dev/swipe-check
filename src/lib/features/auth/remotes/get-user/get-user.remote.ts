import { query } from '$app/server';

import getUserHandler from './get-user.handler';

export const getUser = query(getUserHandler);
