require('dotenv').config()
const Router = require('express').Router;
const coursesBundleController = require('../../controllers/course/courses-bundle.controller');
const authenticate = require('../../middlewares/authenticate.middleware');
const isTeacher = require('../../middlewares/teacher-perm.middleware');

const router = new Router();

router.post(
	'/',
    coursesBundleController.create
);

router.get(
    '/:id',
    coursesBundleController.getById
)

router.get(
    '/',
    coursesBundleController.get
)

module.exports = router;
