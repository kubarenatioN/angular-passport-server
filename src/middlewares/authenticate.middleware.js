const passport = require('passport');

function authenticate(options = {}) {
    return passport.authenticate('jwt', {
        session: false,
        ...options,
    });
}

module.exports = authenticate