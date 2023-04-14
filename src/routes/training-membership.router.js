const Router = require('express').Router;
const trainingMembershipController = require('../controllers/training-membership.controller');

const router = new Router();

router.post(
    '/members',
    trainingMembershipController.getMembersProfiles
)

router.post(
    '/enroll',
    trainingMembershipController.createEnroll
)

router.patch(
    '/enroll',
    trainingMembershipController.updateEnroll
)

router.post(
    '/lookup',
    trainingMembershipController.lookup
)

module.exports = router