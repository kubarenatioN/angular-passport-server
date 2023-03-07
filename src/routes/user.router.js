const Router = require('express').Router;
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate.middleware');

const router = new Router();

router.get(
    '/:id',
    authenticate(),
    userController.getById
)

module.exports = router