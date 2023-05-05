require('dotenv').config();
const crypto = require('crypto');
const { generateUUID } = require('../helpers/common.helper');
const User = require('../models/user.model');
const UserTrainingProfile = require('../models/user-training-profile.model');
const { signToken, verifyToken } = require('../helpers/token-helper');

const { JWT_PRIVATE_KEY } = process.env;

class UserController {
    
    create = async (req, res) => {

        try {
            const { email, password } = req.body;
            const salt = createSalt();
            const hash = hashPassword(password, salt);
            const uuid = generateUUID()

            const trainingProfile = await (new UserTrainingProfile.Model({
                uuid: generateUUID(),
                competencies: [],
                finishedTrainigns: [],
            })).save()

            const user = new User.Model({
                uuid,
                email,
                username: email,
                salt,
                password: hash,
                trainingProfile: trainingProfile._id
            })
            const created = await user.save()

            res.status(200).json({
                message: 'User created',
                user: {
                    _id: created._id,
                    uuid,
                    email,
                    username: email,
                    role: created.role,
                    permission: created.permission,
                }
            });

        } catch (error) {
            return res.status(500).json({
                message: 'Error registering new user.',
            })
        }
		
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
            role: 'student',
            permission: 'student',
        }).save()

        return {
            uuid: created.uuid,
            email,
            username,
            photo,
            role: created.role,
            permission: created.permission,
        }
	}

	findByEmail = async ({email, socialId}) => {
        return User.Model.findOne({
            email,
            socialId,
        }).populate('trainingProfile')
	}

    loginJwt = async (req, res) => {
        try {
            const { password, email: reqEmail } = req.body
            const user = await this.findByEmail({ email: reqEmail })
            
            if (!user) {
                return handleRequestError(res, 404, 'User not found.')
            }

            if (!user.salt) {
                return handleRequestError(res, 404, 'No user salt found.')
            }

            if (!comparePasswords(password, user.salt, user.password)) {
                return handleRequestError(res, 404, 'Incorrect password.')
            }

            const {
                uuid,
                email,
                username,
                photo,
                role,
                _id,
                permission,
            } = user;

            const payload = {
                _id,
                uuid,
                email,
                username,
                photo,
                role,
                permission
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

function handleRequestError(res, code, message) {
    return res.status(code).json({
        message,
        token: null,
        user: null,
    })
}

const controller = new UserController();

module.exports = controller;