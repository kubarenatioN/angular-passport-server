const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const db = require('../database/db.js')
require('dotenv').config()

/* JWT */
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_PRIVATE_KEY,
}
passport.use(new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    console.log('111 jwtPayload', jwtPayload);
    if (jwtPayload) {
        const user = db.find(jwtOptions.username)
        if (user) {
            return done(null, user)
        } else {
            return done(null, false)
        }
    }
}))