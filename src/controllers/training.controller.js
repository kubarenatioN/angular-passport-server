const { generateUUID } = require('../helpers/common.helper');
const { getCurrentUTCTime } = require('../helpers/time.helper');
const { verifyToken } = require('../helpers/token-helper');
require('dotenv').config()

const TrainingProfile = require('../models/training/training-profile.model');
const CourseTraining = require('../models/training/course-training.model');
const TrainingReply = require('../models/training/training-reply.model');

const progressController = require('../controllers/progress.controller');

const { JWT_PRIVATE_KEY } = process.env

class TrainingController {

    select = async (req, res) => {
        const { authorId, trainingsIds, fields, uuid } = req.body

        try {
            const query = {}
            if (trainingsIds && trainingsIds.length > 0) {
                query['uuid'] = trainingsIds
            }

            let trainings = await CourseTraining.Model.find(query)
            .populate({
                path: 'course',
                select: fields
            })

            if (authorId) {
                trainings = trainings.filter(training => training.course && training.course.authorId === authorId)    
            }

            return res.status(200).json({
                message: 'Select trainings',
                data: trainings
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error selecting trainings',
                data: []
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
                message: 'Success list of trainings',
                data
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error getting courses catalog.',
                error,
            })
        }
    }

    getProfile = async (req, res) => {
        const include = decodeURIComponent(req.query.include)

        try {
            let progress;
            const token = req.headers.authorization
            const payload = await verifyToken(token, JWT_PRIVATE_KEY)
            const senderId = payload._id

            const profile = await this._getProfile(req.body)

            const hasAccess = profile && senderId === profile.student.toString()

            if (include.split(',').includes('progress')) {
                const profileId = profile._id.toString()
                progress = await progressController._getAllProgressByProfile(profileId)
            }

            return res.status(200).json({
                message: 'Get training profile.',
                profile: hasAccess ? profile : null,
                hasAccess,
                progress
            })
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Error getting training profile.',
                profile: null
            })                
        }
    }

    addReply = async (req, res) => {
        const { reply } = req.body;
        const { profile, sender, topicId, message, taskId, type } = reply;

        try {
            const newReply = new TrainingReply.Model({
                uuid: generateUUID(),
                topicId,
                type,
                taskId,
                message,
                profile,
                sender,
                date: getCurrentUTCTime()
            })
    
            const saved = await newReply.save()
    
            return res.status(200).json({
                message: 'Added new reply',
                reply: saved
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error adding new reply',
                reply: null
            })
        }
    }

    getDiscussionThread = async (req, res) => {
        const { profileId, topicId } = req.body

        try {

            const discussion = await TrainingReply.Model.find({
                topicId,
                profile: profileId
            })
            
            return res.status(200).json({
                message: 'Get topic discussion',
                discussion,
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error getting topic discussion',
                discussion: null,
            })
        }
        
    }

    isAvailableForTraining = async (req, res) => {
        const { userId, trainingUUId } = req.body

        try {
            const training = await CourseTraining.Model.findOne({
                uuid: trainingUUId
            })
    
            if (!training) {
                return res.status(404).json({
                    hasAccess: false,
                    message: 'No training found with UUID provided.'
                })
            }

            const profile = await TrainingProfile.Model.findOne({
                student: userId,
                training: training._id
            })

            if (!profile) {
                return res.status(404).json({
                    hasAccess: false,
                    message: 'Profile for given request not found.'
                })
            }

            const hasAccess = profile.enrollment === 'approved'
    
            return res.status(200).json({
                message: 'Student has access for training. Profile found.',
                hasAccess: hasAccess,
                profile,
            })
        } catch (error) {
            
        }
        
    }

    _getProfile = async (params) => {
        const { trainingId, studentId, fields, uuid } = params

        const query = uuid ? {
            uuid
        } : {
            training: trainingId,
            student: studentId,
        }

        const studentProfile = await TrainingProfile.Model.findOne(query).populate({
            path: 'training',
            model: 'CourseTraining',
            populate: {
                path: 'course',
                model: 'Course',
                select: fields ?? []
            }
        })

        return studentProfile
    }

    createProfile = async (req, res) => {
        const { trainingId, studentId } = req.body

        try {
            const exists = await TrainingProfile.Model.exists({
                trainingId,
                studentId,
            })
    
            if (exists._id != null) {
                return res.status(200).json({
                    message: 'Profile already exists.',
                    profile: exists,
                })
            }
            
            const studentProfile = await this._createProfile(req.body)
            const profile = await TrainingProfile.Model.findOne({
                _id: studentProfile._id
            })

            return res.status(200).json({
                message: 'Profile created.',
                profile,
            })

        } catch (error) {
             return res.status(500).json({
                message: 'Error creating training profile.',
                profile: null,
                studentId,
                trainingId,
            })
        }
    }

    _createProfile = async (payload) => {
        const { trainingId, studentId } = payload

        const newProfile = new TrainingProfile.Model({
            uuid: generateUUID(),
            training: trainingId,
            student: studentId    
        })

        const created = await newProfile.save()

        return created
    }
}

const controller = new TrainingController()
module.exports = controller