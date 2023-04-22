const jwt = require('jsonwebtoken');

const signToken = (payload, secretKey) => {
    return 'Bearer ' + jwt.sign(payload, secretKey, {
        expiresIn: '7d',
    });
}

const verifyToken = (token, secretKey) => {
    const hash = token.split(' ')[1]
    return new Promise((res, rej) => {
        jwt.verify(hash, secretKey, (err, payload) => {
            try {
                if (err) {
                    rej(err)
                }
                res(payload)
            } catch (error) {
                rej(error)
            }
        });
    })
}

module.exports = { signToken, verifyToken }