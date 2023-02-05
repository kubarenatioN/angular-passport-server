const jwt = require('jsonwebtoken');

const signToken = (payload, secretKey) => {
    return 'Bearer ' + jwt.sign(payload, secretKey, {
        expiresIn: '7d',
    });
}

const verifyToken = (token, secretKey, cb) => {
    jwt.verify(token, secretKey, cb);
}

module.exports = { signToken, verifyToken }