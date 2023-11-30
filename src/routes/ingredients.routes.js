const { Router } = require('express');

const IngredientsController = require('../controllers/IngredientsController');

const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const ingredientsRoutes = Router();

const ingredientsController = new IngredientsController();

ingredientsRoutes.use(ensureAuthenticated);

ingredientsRoutes.delete('/:id', ingredientsController.delete);
ingredientsRoutes.post('/:id', ingredientsController.create);

module.exports = ingredientsRoutes;