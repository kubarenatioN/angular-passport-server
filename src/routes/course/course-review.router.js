const Router = require('express').Router;
const courseReviewController = require('../../controllers/course/course-review.contoller');
const isTeacher = require('../../middlewares/teacher-perm.middleware');

const router = new Router();

router.post(
    '/create',
    isTeacher,
    courseReviewController.createVersion
)

router.post(
    '/history',
    courseReviewController.getHistory
)

module.exports = router