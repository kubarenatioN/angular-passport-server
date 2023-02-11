const Router = require('express').Router;
const passport = require('passport');
const coursesController = require('../controllers/course.controller');
const { checkAdminPermission } = require('../middlewares/admin.middlewares');

const router = new Router();

router.post(
	'/',
	passport.authenticate('jwt', {
		session: false,
	}),
	(req, res, next) => {
		const { status } = req.body;
		if (status) {
            const { role } = req.user
            if (role === 'admin' || role === 'teacher') {
                return next()
            }
            return res.status(403).json({
                message: 'No permission for user with such role.'
            })
		}
		else {
            return next();
        }
        // else {
        //     return res.status(400).json({
        //         message: 'No status specified.'
        //     })
        // }
	},
	coursesController.get
);

router.post(
	'/author',
	passport.authenticate('jwt', {
		session: false,
	}),
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
	passport.authenticate('jwt', {
		session: false,
	}),
	coursesController.create
);

router.post(
	'/publish',
	passport.authenticate('jwt', {
		session: false,
	}),
	checkAdminPermission,
	coursesController.publish
);

router.post(
	'/edit',
	passport.authenticate('jwt', {
		session: false,
	}),
	checkAdminPermission,
	coursesController.edit
);

module.exports = router;
