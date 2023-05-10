require('dotenv').config()
const Router = require('express').Router;
const coursesFeedbackController = require('../../controllers/course/course-feedback.controller');

const router = new Router();

router.post(
	'/',
    coursesFeedbackController.create
);

router.get(
    '/',
    coursesFeedbackController.get
)

module.exports = router;
