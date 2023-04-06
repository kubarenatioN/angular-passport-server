const Router = require('express').Router;
const teacherCourseController = require('../../controllers/teacher-courses.controller');

const router = new Router();

router.post(
    '/select', 
    async (req, res, next) => {
        console.log('teacher', req.body);
        return res.json('teacher...')
    }
)

router.post(
    '/membership/update',
    teacherCourseController.updateMembership
)

module.exports = router