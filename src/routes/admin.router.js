const Router = require('express').Router;
const passport = require('passport');
const { checkAdminPermission } = require('../middlewares/admin.middlewares')

const router = Router();

router.get(
	'/',
	passport.authenticate('jwt', {
		session: false,
		failureRedirect: '/auth/fail',
	}),
    checkAdminPermission,
	(req, res, next) => {
        console.log(req.user);
		return res.status(200).json('admin');
	}
);



module.exports = router;
