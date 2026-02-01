import { query } from '$app/server';

import validateUserHandler from './validate-user.handler';

export const validateUser = query(validateUserHandler);
