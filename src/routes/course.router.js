const Router = require('express').Router;
const passport = require('passport');
const coursesController = require('../controllers/course.controller');
const authenticate = require('../middlewares/authenticate.middleware');

const router = new Router();

router.get(
	'/',
	authenticate(),
	coursesController.get
);

router.get(
	'/review/history',
	authenticate(),
	coursesController.getCourseReviewHistory
);

router.post(
	'/author',
	authenticate(),
	(req, res, next) => {
        const { role } = req.user
        if (!role || role === 'student') {
            return res.status(403).json({
                message: 'No permission for user with such role.'
            })
        }

        return next()
	},
	coursesController.getByAuthorId
);

router.post(
	'/create',
	authenticate(),
	coursesController.create
);

// router.post(
// 	'/publish',
// 	authenticate(),
// 	checkAdminPermission,
// 	coursesController.publish
// );

// router.post(
// 	'/edit',
// 	authenticate(),
// 	checkAdminPermission,
// 	coursesController.edit
// );

module.exports = router;
