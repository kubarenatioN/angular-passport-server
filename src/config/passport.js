const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const userController = require('../controllers/user.controller');
const { signToken, verifyToken } = require('../helpers/token-helper');
require('dotenv').config();

/* JWT */
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_PRIVATE_KEY,
};

const googleOptions = {
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: '/auth/google/callback',
};

passport.use(
	new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
		console.log('111 jwt user data', jwtPayload);
		if (jwtPayload) {
			const user = await findUserByEmail(jwtPayload.email, {
                isSocial: false
            });
			if (user) {
				return done(null, user);
			} else {
				return done(null, false);
			}
		}
	})
);

passport.use(
	new GoogleStrategy(googleOptions, async (
		accessToken,
		refreshToken,
		profile,
		done
	) => {
        const { id } = profile
        const email = profile.emails[0].value
        const photo = profile.photos[0].value
        console.log('profile', id, photo, email);
        const user = await findUserByEmail(email, {
            isSocial: true
        });
        if (user) {
            return done(null, user)
        }
        else {
            const user = await saveUser({
                socialId: id,
                email,
                photo,
                username: email,
                social: 'google'
            })
            return done(null, user)
        }
	})
);


async function findUserByEmail(email) {
    return userController.findByEmail(email)
} 

async function saveUser(user) {
    return userController.createFromObject(user)
}