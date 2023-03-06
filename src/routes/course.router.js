const Router = require('express').Router;
const passport = require('passport');
const coursesController = require('../controllers/course.controller');
const authenticate = require('../middlewares/authenticate.middleware');
const isTeacher = require('../middlewares/teacher-perm.middleware');

const router = new Router();

router.get(
    '/members',
    authenticate(),
    isTeacher,
    coursesController.getCourseMembers
)

router.get(
	'/',
	authenticate(),
	coursesController.getAll
);

router.get(
	'/:id',
	authenticate(),
	coursesController.getById
);

router.get(
	'/review/history',
	authenticate(),
	coursesController.getCourseReviewHistory
);

router.post(
	'/teacher',
	authenticate(),
    isTeacher,
	coursesController.getByAuthorId
);

router.post(
	'/student',
	authenticate(),
	coursesController.getStudentCourses
);

router.post(
	'/create',
	authenticate(),
    isTeacher,
	coursesController.create
);

router.post(
    '/enroll',
    authenticate(),
    coursesController.enroll
)

module.exports = router;
