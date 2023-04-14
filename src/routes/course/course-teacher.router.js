const Router = require('express').Router;
const trainingMembershipController = require('../../controllers/training-membership.controller');

const router = new Router();

router.post(
    '/select', 
    async (req, res, next) => {
        console.log('teacher', req.body);
        return res.json('select in teacher...')
    }
)

module.exports = router