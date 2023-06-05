const Router = require('express').Router;
const { generateUUID } = require('../helpers/common.helper');
const authenticate = require('../middlewares/authenticate.middleware');
const UserTrainingProfile = require('../models/user-training-profile.model');
const User = require('../models/user.model');
const TeacherRequest = require('../models/teacher-request.model');
const TrainingProfile = require('../models/training/training-profile.model');
const ProfileProgress = require('../models/progress/profile-progress.model');
const TrainingResult = require('../models/training/training-result.model')
const becomeTeacherRouter = require('./user/become-teacher.router')
const competenciesRouter = require('./user/competencies.router')

const router = new Router();
router.use('/become-teacher', becomeTeacherRouter)
router.use('/competencies', competenciesRouter)

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
                    select: ['uuid', 'authorId', 'duration', 'category', 'competencies', 'topics', 'banner', 'title']
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

router.get(
    '/:id',
    async (req, res) => {
        const { id } = req.params

        try {
            const user = await User.Model.findOne({
                uuid: id
            })

            delete user._doc.password;

            return res.status(200).json({
                user,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error get user by id.',
                error,
            })
        }
    }
)

router.get(
    '/results/:id',
    async (req, res) => {
        const { id } = req.params

        try {
            const user = await User.Model.findOne({
                _id: id
            })

            const userTrainingProfile = await UserTrainingProfile.Model.findOne({
                _id: user.trainingProfile
            })

            const completedTrainings = userTrainingProfile.trainingHistory

            const trainingResults = await TrainingResult.Model.find({
                _id: completedTrainings
            }).populate('profile')

            const currentTrainingProfiles = await TrainingProfile.Model.find({
                student: user._id
            }).populate({
                path: 'training',
                model: 'CourseTraining',
            })

            // console.log(trainingResults);
            // console.log(currentTrainingProfiles);

            const progress = await ProfileProgress.Model.find({
                $or: [
                    { profile: currentTrainingProfiles.map(p => p._id) },
                    { profile: trainingResults.map(res => res.profile._id) },
                ]
            }).populate({
                path: 'profile',
                model: 'TrainingProfile',
                populate: {
                    path: 'training',
                    model: 'CourseTraining',
                    populate: {
                        path: 'course',
                        model: 'Course'
                    }
                }
            })

            return res.status(200).json({
                message: 'Ok',
                completed: trainingResults,
                current: currentTrainingProfiles,
                progress
            })
        } catch (error) {
            return res.status(500).json({
                error
            })
        }
    }
)

module.exports = router