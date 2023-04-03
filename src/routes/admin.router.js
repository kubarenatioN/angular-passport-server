const Router = require('express').Router;
const passport = require('passport');
const coursesController = require('../controllers/course.controller');
const courseReviewController = require('../controllers/course-review.contoller');

const router = Router();

/* ADMIN COURSES ROUTES START */

const coursesRouter = Router()

coursesRouter.post(
    '/review',
    coursesController.get
);

// TODO: Check for bugs
coursesRouter.get(
    '/review/:id',
    coursesController.getOnReviewById
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
