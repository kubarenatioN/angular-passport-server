require('dotenv').config();
const crypto = require('crypto');
const { db } = require('../database/db');
const { generateUUID } = require('../helpers/common.helper');
const User = require('../models/user.model');
const { signToken, verifyToken } = require('../helpers/token-helper');

const table = 'users-test';
const { JWT_PRIVATE_KEY } = process.env;

class UserController {
    
    create = async (req, res) => {
		const { email, password } = req.body;
        const salt = createSalt();
        const hash = hashPassword(password, salt);
        const uuid = generateUUID()

        const user = new User.Model({
            uuid,
            email,
            username: email,
            salt,
            password: hash,
        })
        const created = await user.save()

        res.status(200).json({
            message: 'User created',
            user: {
                _id: created._id,
                uuid,
                email,
                username: email,
                role: created.role
            }
        });
	}

	createFromSocial = async (user) => {
        const { email, photo, username, socialId, socialType } = user
        const uuid = generateUUID()
        
        const created = await new User.Model({
            uuid,
            email,
            username,
            socialId,
            socialType,
            photo,
            role: 'student'
        }).save()

        return {
            uuid: created.uuid,
            email,
            username,
            photo,
            role: created.role,
        }
	}

	findByEmail = async ({email, socialId}) => {
        return User.Model.findOne({
            email,
            socialId,
        })
	}

    loginJwt = async (req, res) => {
        try {
            const { password, email: reqEmail } = req.body
            const user = await this.findByEmail({ email: reqEmail })
            
            if (!user) {
                throw new Error('User not found.')
            }

            if (!user.salt) {
                throw new Error('No user salt found.')
            }

            if (!comparePasswords(password, user.salt, user.password)) {
                throw new Error('Incorrect password.')
            }

            const {
                uuid,
                email,
                username,
                photo,
                role,
                _id,
            } = user;

            const payload = {
                _id,
                uuid,
                email,
                username,
                photo,
                role,
            }

            const token = signToken(payload, JWT_PRIVATE_KEY);

            return res.status(200).json({
                token,
                message: 'Logged in successfully.',
                user: payload,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Login error.',
                token: null,
                user: null,
                error: error.message
            })
        }
    }
}

function createSalt() {
	return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
	return crypto.pbkdf2Sync(password, salt, 1000, 32, `sha512`).toString(`hex`);
}

function comparePasswords(password, salt, hash) {
	return hashPassword(password, salt) === hash;
}

const controller = new UserController();

module.exports = controller;
