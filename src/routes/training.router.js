const Router = require('express').Router;
const trainingController = require('../controllers/training.controller');
const isTeacher = require('../middlewares/teacher-perm.middleware')

const router = Router()

router.post(
    '/available',
    trainingController.isAvailableForUser
);

router.post(
    '/profile/create',
    trainingController.createProfile
);

router.post(
    '/profile',
    async (req, res) => {
        const { trainingId, studentId } = req.body

        try {
            let profile = await trainingController.getProfile({
                trainingId,
                studentId
            })

            if (!profile) {
                profile = await trainingController._createProfile(req.body)
            }

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
    trainingController.addCheck
);

module.exports = router;
