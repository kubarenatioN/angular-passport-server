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
			return checkAdminPermission(req, res, next);
		}
		return next();
	},
	coursesController.get
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
