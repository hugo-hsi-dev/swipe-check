import { form } from '$app/server';
import deleteUserHandler from './deleteUser.handler';
import { deleteUserSchema } from './deleteUser.schema';

export const deleteUser = form(deleteUserSchema, deleteUserHandler);
