const Router = require('express').Router;
const crypto = require('crypto');
const userController = require('../controllers/user.controller');
const jwt = require('jsonwebtoken');
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

			const { id, email, username, salt, password: hashedPassword } = user;

			if (!comparePasswords(password, salt, hashedPassword)) {
				return res.status(401).json({
					message: 'Incorrect password.',
				});
			}

			const payload = {
				id,
				email,
				username,
			};
			const token = jwt.sign(payload, JWT_PRIVATE_KEY, {
				expiresIn: '7d',
			});

			return res.status(200).json({
				token: `Bearer ${token}`,
				message: 'Logged in successfully',
				user: {
					id,
					email,
					username,
				},
			});
		})
		.catch((err) => {
			console.error(`Login error: ${err}`);
		});
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

	jwt.verify(token, JWT_PRIVATE_KEY, (err, user) => {
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

router.get('/fail', (req, res) => {
	return res.status(401).json({
		message: 'Not authorized',
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
