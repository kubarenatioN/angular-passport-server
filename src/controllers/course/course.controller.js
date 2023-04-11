const { getCurrentUTCTime } = require('../../helpers/time.helper');
const courseReviewController = require('./course-review.contoller')
const courseTrainingConroller = require('./course-training.controller')

const Course = require('../../models/course.model')
const CourseTraining = require('../../models/course-training.model')
const CourseMembership = require('../../models/course-membership.model');
const CourseReview = require('../../models/course-review.model');


class CoursesController {

    get = async (req, res) => {
        const { type } = req.body

        try {
            switch (type) {
                case 'review': {
                    const courses = await courseReviewController.select(req.body)
                    return res.status(200).json({
                        type,
                        data: courses
                    })
                }

                case 'published': {
                    const courses = await this.select(req.body)

                    return res.status(200).json({
                        type,
                        data: courses
                    })
                }

                case 'training': {
                    const { authorId, fields, coursesIds } = req.body

                    let userCourses = []
                    if (authorId) {
                        userCourses = await Course.Model.find({
                            authorId,
                        }).select('uuid')
                    }

                    const trainings = await courseTrainingConroller.get({
                        coursesIds: userCourses ? userCourses.map(course => course.uuid) : [],
                        uuid: coursesIds ?? [],
                        fields,
                    })

                    return res.status(200).json({
                        type,
                        data: trainings
                    })
                }
            
                default: {
                    return res.status(404).json({
                        data: [],
                        message: 'No correct "type" provided.'
                    })
                }
            }
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
            const data = await CourseTraining.Model.find({

            }).skip(offset).limit(limit)
            .populate({
                path: 'course',
                select: fields,
            })
            
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
        const { course, masterId } = req.body
        delete course._id
        course.createdAt = getCurrentUTCTime()

        try {
            const record = await Course.create(course)

            // Remove from review all records with masterId
            const removed = await CourseReview.Model.deleteMany({
                $or: [
                    { uuid: masterId },
                    { masterId }
                ]
            })
            const courseTraining = await CourseTraining.createFromNewCourse(record._doc, getCurrentUTCTime());

            return res.status(200).json({
                message: 'Success. Course training created.',
                course: courseTraining
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

            const courseTrainings = await CourseTraining.Model.find({
                uuid: {
                    $in: coursesIds
                }
            }).populate({
                path: 'course',
                select: fields
            })

            const data = courseTrainings.map(training => {
                const membership = userCourses.find(uc => uc.courseId === training.uuid)
                training._doc.membership = membership
                return training
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
