const Router = require('express').Router;
const courseMembershipController = require('../../controllers/course/course-membership.controller');

const router = new Router();

router.post(
    '/members',
    courseMembershipController.getMembers
)

router.post(
    '/enroll',
    courseMembershipController.handleEnroll
)

router.post(
    '/lookup',
    courseMembershipController.lookup
)

module.exports = router