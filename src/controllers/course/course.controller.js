const { getCurrentUTCTime } = require('../../helpers/time.helper');
const courseReviewController = require('./course-review.contoller')

const Course = require('../../models/course.model')
const CourseTraining = require('../../models/training/course-training.model')
const CourseReview = require('../../models/course-review.model');
const User = require('../../models/user.model');

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
            
                default: {
                    return res.status(404).json({
                        data: [],
                        message: 'Incorrect "type" provided.'
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

    select = async (options) => {
        const { authorId, coursesIds, fields } = options
        const include = decodeURIComponent(options?.include)
        const courses = await Course.get({
            authorId,
            ids: coursesIds,
            fields
        })

        if (include.includes('training')) {
            const trainings = await CourseTraining.Model.find({
                course: courses.map(c => c._id)
            })

            courses.forEach((course, i, arr) => {
                const courseTraining = trainings.find(t => {
                    return t.course.toString() === course._id.toString() && t.status === 'active'
                })

                arr[i]._doc['training'] = courseTraining
            })
        }
        
        return courses;
    }

    list = async (req, res) => {
        const { options } = req.body
        const { pagination, filters, fields, sort } = options

        try {
            const courses = await Course.Model.find({

            })

            const trainings = await CourseTraining.Model.find({

            })

            const authors = await User.Model.find({
                permission: 'teacher'
            })

            courses.forEach((c, i, arr) => {
                arr[i]._doc.trainings = trainings.filter(t => t.course.toString() === c._id.toString())
                const author = authors.find(a => a.uuid === c.authorId)
                arr[i]._doc.author = {
                    username: author.username,
                    photo: author.photo,
                }
            })

            return res.status(200).json({
                message: 'Get list',
                data: courses
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error listing courses',
                error
            })
        }
    }

    publish = async (req, res) => {
        try {
            const { course, masterId } = req.body
            if (course._id) {
                delete course._id
            }
            course.createdAt = getCurrentUTCTime()

            const record = await Course.create(course)

            // Remove from review all records with masterId
            const removed = await CourseReview.Model.deleteMany({
                $or: [
                    { uuid: masterId },
                    { masterId }
                ]
            })

            return res.status(200).json({
                message: 'Success. Course created.',
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

    getCourseTrainings = async (req, res) => {
        const { courseId } = req.params

        try {
            const trainings = await CourseTraining.Model.find({
                courseId,
            }).populate('course')

            return res.status(200).json({
                message: 'Get course trainings',
                trainings,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error getting course trainings.',
                trainings: null,
            })
        }
    }

    getCoursesForBundle = async (req, res) => {
        const { authorId } = req.query

        try {
            const courses = await Course.Model.find({
                $or: [
                    { authorId: authorId },
                    { allowInBundle: true },
                ]
            })

            const teachers = await User.Model.find({
                permission: 'teacher'
            })

            courses.forEach((c, i, arr) => {
                const courseAuthor = teachers.find(t => t.uuid === arr[i].authorId)
                arr[i]._doc.author = {
                    photo: courseAuthor.photo,
                    username: courseAuthor.username
                }
            })

            return res.status(200).json({
                message: 'Ok',
                data: courses,
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error getting courses for bundle.',
                data: null,
            })
        }
    }
}

const controller = new CoursesController();

module.exports = controller;
