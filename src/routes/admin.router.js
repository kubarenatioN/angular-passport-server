const Router = require('express').Router;
const passport = require('passport');
const coursesController = require('../controllers/course.controller');

const router = Router();

/* ADMIN COURSES ROUTES START */

const coursesRouter = Router()

coursesRouter.post(
    '/review',
    coursesController.get
);

coursesRouter.get(
    '/review/:id',
    coursesController.getOnReviewById
);

coursesRouter.post(
    '/publish',
    coursesController.publish
);

/* ADMIN COURSES ROUTES END */

router.use('/courses', coursesRouter)
// router.use('/boards', boardsRouter)

module.exports = router;
