const Router = require('express').Router;
const crypto = require('crypto');
const passport = require('passport');
const { getRedirectWindowHtml } = require('../helpers/auth-redirect-window');
const userController = require('../controllers/user.controller');
const { signToken, verifyToken } = require('../helpers/token-helper');
const socialSuccessAuth = require('../middlewares/social-auth-success.middleware');
require('dotenv').config();

const router = Router();
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

router.post('/login/jwt', (req, res) => {
	const { email, password } = req.body;
	userController
		.findByEmail(email)
		.then((user) => {
			if (!user) {
				return res.status(401).json({
					message: 'User not found.',
				});
			}

			const {
				id,
				email,
				salt,
                username,
                photo,
                role,
				password: hashedPassword,
			} = user;

			if (!comparePasswords(password, salt, hashedPassword)) {
				return res.status(401).json({
					message: 'Incorrect password.',
				});
			}

			const payload = {
				id,
				email,
                username,
                photo,
                role
			};
			const token = signToken(payload, JWT_PRIVATE_KEY);

			return res.status(200).json({
				token: token,
				message: 'Logged in successfully',
				user: payload,
			});
		})
		.catch((err) => {
			console.error(`Login error: ${err}`);
		});
});

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

router.get('/login/social/success', (req, res) => {
	// console.log('111 success', res.user);
	// const token = signToken({ 
    //     username: 'test username',
    //     email: 'test 123'
    // }, JWT_PRIVATE_KEY);
	// const postBackUri = 'http://localhost:4200';
	// return res.send(getRedirectWindowHtml({ token, postBackUri }));
});

router.post('/register', (req, res) => {
	const { email, password } = req.body;
	const salt = createSalt();
	const hash = hashPassword(password, salt);

	const user = {
		salt,
		email,
		password: hash,
	};

	userController.createWithPromise(user).then(({ id, email, username }) => {
		res.status(200).json({
			id,
			email,
			username,
		});
	});
});

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
			});
		}
		return res.status(200).json({
			user,
			message: 'Success',
		});
	});
});

function createSalt() {
	return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
	return crypto.pbkdf2Sync(password, salt, 1000, 32, `sha512`).toString(`hex`);
}

function comparePasswords(password, salt, hashedPassword) {
	const hash = hashPassword(password, salt);
	return hashedPassword === hash;
}

module.exports = router;
