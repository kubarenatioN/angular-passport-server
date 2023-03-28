const Router = require('express').Router;
const trainingController = require('../controllers/training.controller');

const router = Router()

router.get(
    '/test',
    trainingController.test
);

module.exports = router;
