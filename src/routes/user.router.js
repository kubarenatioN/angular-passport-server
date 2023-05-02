const Router = require('express').Router;
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate.middleware');
const UserTrainingProfile = require('../models/user-training-profile.model');
const User = require('../models/user.model');

const router = new Router();

router.get(
    '/',
    async (req, res) => {
        const { id } = req.params
        const include = req.query

        return res.status(200).json({
            test: true
        })
    }
)

router.get(
    '/training/:id',
    authenticate(),
    async (req, res) => {
        const { id } = req.params
        
        try {
            const user = await User.Model.findOne({
                _id: id
            })
            const profile = await UserTrainingProfile.Model.findOne({
                _id: user.trainingProfile
            })

            return res.status(200).json({
                message: 'Get user training profile.',
                profile: profile
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error get user training profile.'
            })
        }
    }
)

module.exports = router