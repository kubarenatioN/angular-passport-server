const Router = require('express').Router;
const personalizationController = require('../controllers/personalization.controller')

const router = new Router();

router.post(
    '/assign',
    personalizationController.assignTasks
)

router.get(
    '/task',
    personalizationController.getTasks
)

router.post(
    '/task',
    personalizationController.createTask
)

module.exports = router;