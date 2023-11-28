const { Router } = require('express');
const multer = require('multer');
const uploadConfig = require('../configs/upload');

const DishesController = require('../controllers/DishesController');
const DishesPicturesController = require('../controllers/DishesPicturesController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const dishesRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const dishesController = new DishesController();
const dishesPicturesController = new DishesPicturesController();

dishesRoutes.use(ensureAuthenticated);

dishesRoutes.post('/', dishesController.create);
dishesRoutes.get('/:id', dishesController.show);
dishesRoutes.delete('/:id', dishesController.delete);
dishesRoutes.get('/', dishesController.index);
dishesRoutes.put('/:id', dishesController.update);
dishesRoutes.patch('/picture', upload.single('picture'), dishesPicturesController.update);


module.exports = dishesRoutes;