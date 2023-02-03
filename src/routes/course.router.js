const Router = require('express').Router;
const passport = require('passport');
const coursesController = require('../controllers/course.controller')

const router = new Router();

router.get('/', coursesController.get)
router.post('/create', coursesController.create)
router.post('/publish', coursesController.publish)

module.exports = router