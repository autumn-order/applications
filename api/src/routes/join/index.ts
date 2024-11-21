import { Hono } from 'hono';

import statsRoute from '../join/stats';

const joinRoutes = new Hono();

joinRoutes.route('/stats', statsRoute);

export default joinRoutes;