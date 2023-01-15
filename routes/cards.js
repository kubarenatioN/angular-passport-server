const Router = require("express").Router;
const passport = require("passport");

const router = Router();

router.get(
    "/list",
    passport.authenticate("jwt", {
        session: false,
        failureRedirect: "/auth/fail",
    }),
    (req, res, next) => {
        console.log("cards router req");
        return res.status(200).json([]);
    }
);

module.exports = { cardsRouter: router };
