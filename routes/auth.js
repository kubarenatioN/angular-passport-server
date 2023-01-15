const Router = require('express').Router;
const crypto = require('crypto')
const db = require('../database/db.js')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const router = Router();
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY

router.post('/login/jwt', (req, res, next) => {
    const { username, password } = req.body
    db.find(username)
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: "User not found."
                })
            }

            if (!comparePasswords(password, user.salt, user.password)) {
                return res.status(401).json({
                    message: "Incorrect password."
                })
            }

            const payload = {
                id: user.id,
                username: user.username,
            }
            const token = jwt.sign(payload, JWT_PRIVATE_KEY, {
                expiresIn: '7d',
            })
            return res.status(200).json({
                token: `Bearer ${token}`,
                message: "Logged in successfully"
            })
        })
})

router.post('/register', (req, res, next) => {
    const { username, password } = req.body
    const salt = createSalt()
    const hash = hashPassword(password, salt)

    const user = {
        salt,
        username,
        password: hash,
    }

    db.add(user)
        .then(user => {
            console.log('111 registered user', user);
            res.status(200).json({
                id: user.id,
                username: user.username,
            })
        })
})

router.get('/fail', (req, res) => {
    return res.status(401).json({
        message: 'Not authorized',
    })
})

function createSalt() {
    return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 32, `sha512`).toString(`hex`)
}

function comparePasswords(password, salt, hashedPassword) {
    const hash = hashPassword(password, salt);
    return hashedPassword === hash;
};

module.exports = { authRouter: router }