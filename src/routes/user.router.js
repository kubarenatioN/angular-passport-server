const Router = require('express').Router;
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate.middleware');

const router = new Router();

router.get(
    '/:id',
    authenticate(),
    async (req, res) => {
        return res.json('Not implemented')
    }
)

module.exports = router