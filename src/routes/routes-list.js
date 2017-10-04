import list from './../controllers/ctrl-list';

export default (api, requireAuth) => {
  api.post('/lists', requireAuth, list.getLists);
  api.post('/list', requireAuth, list.postList);
  api.post('/list/:id', requireAuth, list.getList);
  api.put('/list/:id', requireAuth, list.updateList);
  api.delete('/list/:id', requireAuth, list.deleteList);
};
