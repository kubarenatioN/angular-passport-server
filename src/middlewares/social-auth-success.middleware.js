const { signToken } = require('../helpers/token-helper');
const { getRedirectWindowHtml } = require('../helpers/auth-redirect-window');
const { CLIENT_URL } = require('../config/urls');
require('dotenv').config();

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY
const socialSuccessAuth = (req, res) => {
    // console.log('socialSuccessAuth user', req.user);
    const { id, email, username, photo, role } = req.user
    const token = signToken({ 
        id,
        email,
        username,
        photo,
        role,
    }, JWT_PRIVATE_KEY);
    const postBackUri = CLIENT_URL;
    return res.send(getRedirectWindowHtml({ token, postBackUri }));
}

module.exports = socialSuccessAuth;