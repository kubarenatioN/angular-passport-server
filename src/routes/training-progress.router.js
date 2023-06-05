const Router = require('express').Router;
const progressController = require('../controllers/progress.controller');

const router = new Router();

router.post(
    '/',
    progressController.get
)

router.get(
    '/profile/:id',
    progressController.getProfileProgress
)

router.patch(
    '/add',
    progressController.addRecord
)

module.exports = router