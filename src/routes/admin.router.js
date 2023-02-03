const Router = require('express').Router;
const passport = require('passport');

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

function checkAdminPermission(req, res, next) {
    const { role } = req.user
    if (role === 'admin') {
        return next()
    }

    return res.status(400).json({
        message: 'No permission for not admin users.'
    })
}

module.exports = router;
