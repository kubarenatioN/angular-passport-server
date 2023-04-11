const Router = require('express').Router;
const trainingController = require('../controllers/training.controller');
const isTeacher = require('../middlewares/teacher-perm.middleware')

const router = Router()

router.post(
    '/available',
    trainingController.isAvailableForUser
);

router.post(
    '/answer',
    trainingController.addAnswer
);

router.post(
    '/check',
    isTeacher,
    trainingController.addCheck
);

module.exports = router;
