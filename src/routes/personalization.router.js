const Router = require('express').Router;
const personalizationController = require('../controllers/personalization.controller')

const router = new Router();

router.get(
    '/:profileId',
    personalizationController.getProfilePersonalization
)

router.post(
    '/assign',
    personalizationController.assignTasks
)

router.get(
    '/teacher/task',
    personalizationController.getTeacherTasks
)

router.post(
    '/teacher/task',
    personalizationController.createTask
)

module.exports = router;