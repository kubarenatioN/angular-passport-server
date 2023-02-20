const { signToken } = require('../helpers/token-helper');
const { getRedirectWindowHtml } = require('../helpers/auth-redirect-window');
require('dotenv').config();

const CLIENT_URL = 'http://localhost:4200'
// const CLIENT_URL = 'https://dev--soft-eclair-ced231.netlify.app'

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