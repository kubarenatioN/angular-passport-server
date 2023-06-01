const { signToken, prepareTokenPayload } = require('../helpers/token-helper');
const { getRedirectWindowHtml } = require('../helpers/auth-redirect-window');
const { CLIENT_URL } = require('../config/urls');
require('dotenv').config();

const { JWT_PRIVATE_KEY } = process.env

const socialSuccessAuth = (req, res) => {
    const tokenPayload = prepareTokenPayload(req.user)
    const token = signToken(tokenPayload, JWT_PRIVATE_KEY);
    const postBackUri = CLIENT_URL;
    return res.send(getRedirectWindowHtml({ token, postBackUri }));
}

module.exports = socialSuccessAuth;