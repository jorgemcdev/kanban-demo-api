
import auth from '../controllers/ctrl-auth';

export default (api, requireAuth) => {
  api.post('/signup', auth.signupUser);
  api.post('/login', auth.loginUser);
  api.post('/user-exists', auth.userExists);
  api.post('/password-request', auth.requestPassword);
  api.post('/password-reset', auth.resetPassword);
  api.post('/password-change', auth.changePassword);
  api.post('/refresh-token', requireAuth, auth.refreshToken);
};

