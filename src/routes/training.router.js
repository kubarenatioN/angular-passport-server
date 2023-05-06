const Router = require('express').Router;
require('dotenv').config()
const trainingController = require('../controllers/training.controller');
const isTeacher = require('../middlewares/teacher-perm.middleware')
const authenticate = require('../middlewares/authenticate.middleware');
const membershipRouter = require('./training-membership.router')
const progressRouter = require('./training-progress.router');

const router = Router()

router.use('/membership', authenticate(), membershipRouter)
router.use('/progress', authenticate(), progressRouter)

router.post(
	'/start/:id',
	trainingController.start
)

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
	'/student',
	authenticate(),
	trainingController.getStudentProfiles
);

router.post(
    '/profiles',
	authenticate(),
    isTeacher,
    trainingController.getTrainingProfiles
);

router.post(
    '/profile',
    trainingController.getProfile
);

router.post(
    '/discussion',
    trainingController.getDiscussionThread
)

router.post(
    '/reply',
    trainingController.addReply
);

module.exports = router;
