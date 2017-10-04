import user from './../controllers/ctrl-user';
import auth from '../controllers/ctrl-auth';

export default (api, requireAuth) => {
  api.get('/users', requireAuth, user.getUsers);
  api.post('/user', requireAuth, user.postUser);
  api.get('/user/:id', requireAuth, user.getUser);
  api.put('/user/:id', requireAuth, user.updateUser);
  api.delete('/user/:id', requireAuth, user.deleteUser);
  api.post('/user/change-password', requireAuth, auth.changePassword);
  api.post('/user/upload', requireAuth, user.postUserUpload);
};
