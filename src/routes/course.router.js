const Router = require('express').Router;
const passport = require('passport');
const coursesController = require('../controllers/course.controller');
const courseReviewController = require('../controllers/course-review.contoller');
const teacherCourseController = require('../controllers/teacher-courses.controller');
const courseMembership = require('../controllers/course-membership.controller');
const authenticate = require('../middlewares/authenticate.middleware');
const isTeacher = require('../middlewares/teacher-perm.middleware');
const { verifyToken } = require('../helpers/token-helper');
require('dotenv').config()

const { JWT_PRIVATE_KEY } = process.env

const router = new Router();

/* REVIEW START */ 
const reviewRouter = new Router();

reviewRouter.post(
    '/create',
    isTeacher,
    courseReviewController.createVersion
)

reviewRouter.post(
    '/history',
    courseReviewController.getHistory
)

router.use('/review', authenticate(), reviewRouter)
/* REVIEW END */ 


/* TEACHER START */ 
const teacherRouter = new Router();

teacherRouter.post(
    '/select', 
    async (req, res, next) => {
        console.log('teacher', req.body);
        return res.json('teacher...')
    }
)

teacherRouter.post(
    '/membership',
    teacherCourseController.handleMembership
)

router.use('/teacher', authenticate(), isTeacher, teacherRouter)
/* TEACHER END */ 

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
    '/membership',
    coursesController.handleMembership
)

router.get(
	'/:id',
	authenticate(),
    async (req, res) => {
        return res.send('Not implemented')
    },
	// coursesController.getById
);

router.get(
	'/review/history',
	authenticate(),
    async (req, res) => {
        return res.send('Not implemented')
    },
	// coursesController.getCourseReviewHistory
);

router.post(
	'/teacher',
	authenticate(),
    isTeacher,
    async (req, res) => {
        return res.send('Not implemented')
    },
	// coursesController.getByAuthorId
);

router.post(
	'/student',
	authenticate(),
    async (req, res) => {
        return res.send('Not implemented')
    },
	// coursesController.getStudentCourses
);

router.post(
	'/create',
	authenticate(),
    isTeacher,
    async (req, res) => {
        return res.send('Not implemented')
    },
	// coursesController.create
);

router.post(
    '/enroll',
    authenticate(),
    async (req, res) => {
        return res.send('Not implemented')
    },
    // coursesController.enroll
)

module.exports = router;
