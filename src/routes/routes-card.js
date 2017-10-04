import card from './../controllers/ctrl-card';

export default (api, requireAuth) => {
  api.post('/cards', requireAuth, card.getCards);
  api.post('/card', requireAuth, card.postCard);
  api.post('/card-move', requireAuth, card.postCardMove);
  api.post('/card-atach', requireAuth, card.postCardAtach);
  api.get('/card/:id', requireAuth, card.getCard);
  api.put('/card/:id', requireAuth, card.updateCard);
  api.put('/card-list/:id', requireAuth, card.changeCardList);
  api.delete('/card/:id', requireAuth, card.deleteCard);
};
