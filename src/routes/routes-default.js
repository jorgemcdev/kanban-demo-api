/* Home Route */
export default (app) => {
  app.route('/test')
   .get((req, res) => {
     res.status(200).send({ message: 'Test: API end point.' });
   });
};

