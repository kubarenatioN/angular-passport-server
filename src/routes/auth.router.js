const Router = require('express').Router;
const passport = require('passport');
const userController = require('../controllers/user.controller');
const { verifyToken, signToken, prepareTokenPayload } = require('../helpers/token-helper');
const socialSuccessAuth = require('../middlewares/social-auth-success.middleware');
require('dotenv').config();
const User = require('../models/user.model')

const router = Router();
const { JWT_PRIVATE_KEY } = process.env;

router.post('/login/jwt', userController.loginJwt);

router.get(
	'/login/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
		prompt : 'select_account',
		session: false,
	})
);

router.get(
	'/google/callback',
	passport.authenticate('google', {
		session: false,
		failureRedirect: '/auth/login/failed',
	}),
    socialSuccessAuth,
);

router.get('/login/failed', (req, res) => {
	return res.status(401).json({
		message: 'Login failed',
	});
});

router.post('/register', userController.create);

/* Get User object by token */
router.post('/user', async (req, res) => {
	const token = req.get('Authorization')
	if (!token) {
		return res.status(200).json({
			message: 'No token',
			user: null,
		})
	}
    try {
	    const payload = await verifyToken(token, JWT_PRIVATE_KEY);
		const user = await User.Model.findOne({
			_id: payload._id
		}).populate('trainingProfile')
		delete user._doc.password

		const refreshToken = signToken(
			prepareTokenPayload(user),
			process.env.JWT_PRIVATE_KEY
		)
		return res.status(200).json({
			user,
			message: 'Success auth',
			refreshToken,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error while parsing token',
            error
        });
    }

});

module.exports = router;
