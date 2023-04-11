const Router = require('express').Router;
const passport = require('passport');
const coursesController = require('../controllers/course/course.controller');
const courseReviewController = require('../controllers/course/course-review.contoller');

const router = Router();

/* ADMIN COURSES ROUTES START */

const coursesRouter = Router()

coursesRouter.post(
    '/review',
    coursesController.get
);

coursesRouter.put(
    '/review/update',
    courseReviewController.updateVersion
)

coursesRouter.post(
    '/publish',
    coursesController.publish
);

/* ADMIN COURSES ROUTES END */

router.use('/courses', coursesRouter)
// router.use('/boards', boardsRouter)

module.exports = router;
