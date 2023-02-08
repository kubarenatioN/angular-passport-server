const { signToken } = require('../helpers/token-helper');
const { getRedirectWindowHtml } = require('../helpers/auth-redirect-window');
require('dotenv').config();

const CLIENT_URL = 'http://localhost:4200'

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY
const socialSuccessAuth = (req, res) => {
    console.log('socialSuccessAuth user', req.user);
    const { email, username, photo } = req.user
    const token = signToken({ 
        username,
        email,
        photo
    }, JWT_PRIVATE_KEY);
    const postBackUri = CLIENT_URL;
    return res.send(getRedirectWindowHtml({ token, postBackUri }));
}

module.exports = socialSuccessAuth;