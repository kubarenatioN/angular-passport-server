const Router = require('express').Router;
const trainingController = require('../controllers/training.controller');

const router = Router()

router.post(
    '/answer',
    trainingController.addAnswer
);

module.exports = router;
