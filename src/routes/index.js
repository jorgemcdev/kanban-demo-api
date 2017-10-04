import requireAuth from '../lib/validateToken';

import routesDefault from './routes-default';
import routesAuth from './routes-auth';
import routesUser from './routes-user';
import routesBoard from './routes-board';
import routesList from './routes-list';
import routesCard from './routes-card';

export default (app) => {
  routesDefault(app);
  routesAuth(app, requireAuth);
  routesBoard(app, requireAuth);
  routesList(app, requireAuth);
  routesUser(app, requireAuth);
  routesCard(app, requireAuth);
};
