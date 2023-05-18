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

/**
 * 
 * @param user 
 */
const prepareTokenPayload = (user) => {
    const {
        _id,
        uuid,
        email,
        username,
        photo,
        role,
        permission,
        trainingProfile,
    } = user;

    return {
        _id,
        uuid,
        email,
        username,
        photo,
        role,
        permission,
        trainingProfile,
    }
}

module.exports = { signToken, verifyToken, prepareTokenPayload }