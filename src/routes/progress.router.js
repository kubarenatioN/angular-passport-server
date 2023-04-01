const Router = require('express').Router;
const controller = require('../controllers/progress.controller');

const router = Router()

router.post(
    '/create',
    controller.create
);

module.exports = router;
