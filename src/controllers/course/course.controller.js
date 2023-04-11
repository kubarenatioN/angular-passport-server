const { getCurrentUTCTime } = require('../../helpers/time.helper');
const courseReviewController = require('./course-review.contoller')
const courseTrainingConroller = require('./course-training.controller')

const Course = require('../../models/course.model')
const CourseTraining = require('../../models/course.model')
const CourseMembership = require('../../models/course-membership.model')


class CoursesController {

    get = async (req, res) => {
        const { type } = req.body

        try {
            switch (type) {
                case 'review': {
                    const courses = await courseReviewController.select(req.body)
                    return res.status(200).json({
                        type: 'review',
                        data: courses
                    })
                }

                case 'training': {
                    const trainings = await courseTrainingConroller.get(req.body)

                    return res.status(200).json({
                        type: 'training',
                        data: trainings
                    })
                }
            
                default:
                    break;
            }

            return res.json(response)
        } catch (error) {
            return res.status(500).json({
                message: 'Error getting courses.',
                error,
            })
        }
    }

    list = async (req, res) => {
        const { pagination, fields } = req.body
        const { offset, limit } = pagination

        try {
            const data = await Course.Model.find({

            }).skip(offset).limit(limit).select(fields)
            
            return res.status(200).json({
                message: 'Success',
                data
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error getting courses catalog.',
                error,
            })
        }
    }

    select = async (options) => {
        const { authorId, coursesIds, fields } = options
        const courses = await Course.get({
            authorId,
            ids: coursesIds,
            fields
        })
        return courses;
    }

    publish = async (req, res) => {
        const { course } = req.body
        delete course._id
        course.createdAt = getCurrentUTCTime()

        try {
            const record = await Course.create(course)

            // Remove from review all records with masterId

            return res.status(200).json({
                message: 'Success',
                course: record
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Error publishing a course',
                error
            })
        }
    }

    getUserCourses = async (req, res) => {
        const { userId, fields } = req.body

        try {
            const userCourses = await CourseMembership.Model.find({
                userId: String(userId)
            })

            const coursesIds = userCourses.map(record => record.courseId)

            const courses = await Course.Model.find({
                uuid: {
                    $in: coursesIds
                }
            }).select(fields)

            const data = userCourses.map(userCourse => {
                const course = courses.find(c => c.uuid === userCourse.courseId)
                return {
                    ...userCourse._doc,
                    course
                }
            })

            return res.status(200).json({
                message: 'Success',
                data
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error getting user courses.'
            })
        }
    }
}

const controller = new CoursesController();

module.exports = controller;
