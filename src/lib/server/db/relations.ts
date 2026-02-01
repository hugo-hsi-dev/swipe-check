import { defineRelations } from 'drizzle-orm';

import * as authSchema from './auth.schema';
import * as appSchema from './app.schema';

export const relations = defineRelations({ ...authSchema, ...appSchema }, () => ({}));
