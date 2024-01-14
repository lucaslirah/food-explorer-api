const { Router } = require('express');

const multer = require('multer');

const uploadConfig = require('../configs/upload');

const DishesController = require('../controllers/DishesController');

const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const verifyUserAuthorization = require('../middlewares/verifyUserAuthorization');

const dishesRoutes = Router();
const upload = multer(uploadConfig.MULTER);
const dishesController = new DishesController();

dishesRoutes.use(ensureAuthenticated);

dishesRoutes.post('/create', verifyUserAuthorization("admin"), upload.single('picture'), dishesController.create);
dishesRoutes.get('/:id', dishesController.show);
dishesRoutes.delete('/:id', verifyUserAuthorization("admin"), dishesController.delete);
dishesRoutes.get('/', dishesController.index);
dishesRoutes.put('/edit/:id', verifyUserAuthorization("admin"), upload.single('picture'), dishesController.update);

module.exports = dishesRoutes;