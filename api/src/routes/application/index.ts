import { Hono } from 'hono';

import applicationRoute from './application';

const applicationRoutes = new Hono();

applicationRoutes.route('/', applicationRoute);

export default applicationRoutes;