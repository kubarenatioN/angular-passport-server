const Router = require('express').Router;
const { generateUUID } = require('../helpers/common.helper');
const authenticate = require('../middlewares/authenticate.middleware');
const UserTrainingProfile = require('../models/user-training-profile.model');
const User = require('../models/user.model');
const TeacherRequest = require('../models/teacher-request.model');
const TrainingProfile = require('../models/training/training-profile.model');
const ProfileProgress = require('../models/progress/profile-progress.model');

const router = new Router();

router.get(
    '/all',
    async (req, res) => {
        try {
            const users = await User.Model.find({})
            
            return res.status(200).json({
                data: users
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error get all users.',
                error,
            })
        }
    }
)

router.get(
    '/become-teacher',
    async (req, res) => {
        try {
            const requests = await TeacherRequest.Model.find({

            }).populate('user')

            return res.status(200).json({
                message: 'Get teacher perm requests',
                data: requests,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error get teacher permission requests.',
                error,
            })
        }
    }
)

router.get(
    '/become-teacher/:id',
    async (req, res) => {
        const { id } = req.params

        try {
            const request = await TeacherRequest.Model.findOne({
                user: id
            }).populate('user')

            return res.status(200).json({
                message: 'Get teacher perm status',
                request,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error get teacher permission request status.',
                error,
            })
        }
    }
)

router.post(
    '/become-teacher',
    async (req, res) => {
        const { userId, motivation } = req.body.request

        try {
            const user = await User.Model.findOne({
                _id: userId,
            })

            if (!user) {
                return res.status(400).json({
                    message: 'No user.',
                })
            }

            const request = await (new TeacherRequest.Model({
                uuid: generateUUID(),
                user: user._id,
                motivation,
                status: 'pending',
            })).save()

            return res.status(200).json({
                message: 'Request created. Status: pending',
                request
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error get teacher permissions.',
                error,
            })
        }
    }
)

router.patch(
    '/become-teacher/:id',
    async (req, res) => {
        const { id } = req.params
        const { status } = req.body

        try {
            if (status === 'approved') {
                const user = await User.Model.findOne({
                    _id: id
                })
                user.permission = 'teacher'
                await user.save()
            }

            const request = await TeacherRequest.Model.findOne({
                user: id
            })

            request.status = status
            const updated = await request.save()

            return res.status(200).json({
                message: `Request status changed. Status: ${status}`,
                updated,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error update teacher permission status.',
                error,
            })
        }
    }
)

router.delete(
    '/become-teacher/:id',
    async (req, res) => {
        const { id } = req.params

        try {
            await TeacherRequest.Model.deleteOne({
                _id: id
            })

            return res.status(200).json({
                message: 'Deleted teacher perms request',
                request: null,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error delete teacher permission request.',
                error,
            })
        }
    }
)

router.get(
    '/training/:id',
    authenticate(),
    async (req, res) => {
        const { id } = req.params
        
        try {
            const user = await User.Model.findOne({
                _id: id
            })
            const profile = await UserTrainingProfile.Model.findOne({
                _id: user.trainingProfile
            })

            return res.status(200).json({
                message: 'Get user training profile.',
                profile: profile
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error get user training profile.'
            })
        }
    }
)

router.get(
    '/:id/dashboard',
    async (req, res) => {
        const { id } = req.params

        try {
            const profiles = await TrainingProfile.Model.find({
                student: id,
                enrollment: ['approved', 'pending'],
                // status: 'active'
            }).populate({
                path: 'training',
                model: 'CourseTraining',
                populate: {
                    path: 'course',
                    model: 'Course',
                    select: ['uuid', 'authorId', 'duration', 'category', 'competencies', 'topics', 'banner']
                }
            })

            const progress = await ProfileProgress.Model.find({
                profile: profiles.map(p => p._id)
            })

            return res.status(200).json({
                origin: 'User dashboard',
                data: {
                    profiles,
                    progress,
                }
            })
            
        } catch (error) {
            return res.status(500).json({
                message: 'Error get user dashboard.'
            })
        }
    }
)

module.exports = router