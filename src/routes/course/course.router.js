const Router = require('express').Router;
const coursesController = require('../../controllers/course/course.controller');
const authenticate = require('../../middlewares/authenticate.middleware');
const isTeacher = require('../../middlewares/teacher-perm.middleware');
require('dotenv').config()

const reviewRouter = require('./course-review.router')
const teacherRouter = require('./course-teacher.router')
const membershipRouter = require('./course-membership.router')

const router = new Router();

router.use('/review', authenticate(), reviewRouter)
router.use('/teacher', authenticate(), isTeacher, teacherRouter)
router.use('/membership', authenticate(), membershipRouter)

router.post(
	'/select',
	authenticate(),
    coursesController.get
);

router.post(
	'/list',
	authenticate(),
	coursesController.list
);

router.post(
    '/student',
    coursesController.getUserCourses
)

module.exports = router;
