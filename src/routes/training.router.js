const Router = require('express').Router;
const trainingController = require('../controllers/training.controller');
const isTeacher = require('../middlewares/teacher-perm.middleware')
const authenticate = require('../middlewares/authenticate.middleware');

const router = Router()

const membershipRouter = require('./training-membership.router')

router.use('/membership', authenticate(), membershipRouter)

router.post(
	'/select',
	authenticate(),
	trainingController.select
);

router.post(
	'/list',
	authenticate(),
	trainingController.list
);

router.post(
    '/access',
    trainingController.isAvailableForTraining
);

// router.post(
//     '/profile/create',
//     trainingController.createProfile
// );

router.post(
    '/profile',
    async (req, res) => {
        const { trainingId, studentId, uuid } = req.body

        try {
            let profile = await trainingController.getProfile(req.body)

            // if (!profile) {
            //     profile = await trainingController._createProfile(req.body)
            // }

            return res.status(200).json({
                message: 'Get training profile.',
                profile
            })
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Error getting training profile.',
                profile: null
            })                
        }
    }
);

router.post(
    '/reply',
    trainingController.addReply
);

router.post(
    '/check',
    isTeacher,
    trainingController.addReply
);

module.exports = router;
