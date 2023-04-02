const Router = require('express').Router;
const passport = require('passport');
const coursesController = require('../controllers/course.controller');
const courseReviewController = require('../controllers/course-review.contoller');
const authenticate = require('../middlewares/authenticate.middleware');
const isTeacher = require('../middlewares/teacher-perm.middleware');

const router = new Router();

/* REVIEW START */ 
const reviewRouter = new Router();

reviewRouter.post(
    '/create',
    isTeacher,
    courseReviewController.createVersion
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

router.use('/teacher', authenticate(), isTeacher, teacherRouter)
/* TEACHER END */ 

router.post(
	'/select',
	authenticate(),
    coursesController.get
);

router.get(
    '/members',
    authenticate(),
    isTeacher,
    async (req, res) => {
        return res.send('Not implemented')
    },
    // coursesController.getCourseMembers
)

router.get(
	'/',
	authenticate(),
    async (req, res) => {
        return res.send('Not implemented')
    },
	// coursesController.getAll
);

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
