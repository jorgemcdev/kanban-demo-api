import board from './../controllers/ctrl-board';

export default (api, requireAuth) => {
  api.get('/boards', requireAuth, board.getBoards);
  api.post('/board', requireAuth, board.postBoard);
  api.get('/board/:id', requireAuth, board.getBoard);
  api.put('/board/:id', requireAuth, board.updateBoard);
  api.delete('/board/:id', requireAuth, board.deleteBoard);
};
