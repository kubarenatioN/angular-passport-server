const Router = require('express').Router;
const passport = require('passport');
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../helpers/token-helper');
const socialSuccessAuth = require('../middlewares/social-auth-success.middleware');
require('dotenv').config();

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
router.post('/user', (req, res) => {
	let token = '';
	try {
		token = req.get('Authorization').split(' ')[1];
	} catch (e) {
		return res.status(400).json({
			message: 'Incorrect token',
			error: e,
		});
	}

	verifyToken(token, JWT_PRIVATE_KEY, (err, user) => {
		if (err) {
			return res.status(400).json({
				message: 'Error while parsing token',
                error: err
			});
		}
		return res.status(200).json({
			user,
			message: 'Success auth',
		});
	});
});

module.exports = router;
