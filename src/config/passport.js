const passport = require('passport');
const { userSocialType } = require('../constants/common.constants');
const JwtStrategy = require('passport-jwt').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const userController = require('../controllers/user.controller');
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
		if (jwtPayload) {
            const { email } = jwtPayload
			const user = await findUserByEmail({ email });
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
        // console.log('profile', id, photo, email);
        const user = await findUserByEmail({
            email,
            socialId: id,
        });
        if (user) {
            return done(null, user)
        }
        else {
            const user = await saveUser({
                socialType: userSocialType.google,
                socialId: id,
                email,
                photo,
                username: email,
            })
            return done(null, {
                ...user
            })
        }
	})
);

async function findUserByEmail(payload) {
    return userController.findByEmail(payload)
} 

async function saveUser(user) {
    return userController.createFromSocial(user)
}