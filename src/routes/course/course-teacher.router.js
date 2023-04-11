const Router = require('express').Router;
const membershipController = require('../../controllers/course/course-membership.controller');

const router = new Router();

router.post(
    '/select', 
    async (req, res, next) => {
        console.log('teacher', req.body);
        return res.json('teacher...')
    }
)

router.post(
    '/membership/update',
    membershipController.updateEnroll
)

module.exports = router