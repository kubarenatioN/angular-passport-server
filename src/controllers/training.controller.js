const { enrollStatuses } = require('../constants/common.constants')
const { generateUUID } = require('../helpers/common.helper');
const { getCurrentUTCTime } = require('../helpers/time.helper');

const CourseMembership = require('../models/_training-membership.model');
const TrainingProfile = require('../models/training/training-profile.model');
const CourseTraining = require('../models/training/course-training.model');
const TrainingReply = require('../models/training/training-reply.model');

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
                trainings = trainings.filter(training => training.course.authorId === authorId)    
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

    addReply = async (req, res) => {
        const { reply } = req.body;
        const { profile, sender, topicId, message } = reply;

        try {
            const newReply = new TrainingReply.Model({
                uuid: generateUUID(),
                topicId,
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

    // addAnswer = async (req, res) => {
    //     const { answer, topicId, trainingId, studentId } = req.body
    //     const { type, data, taskId } = answer

    //     try {
    //         const studentProfile = await this.getProfile({
    //             trainingId,
    //             studentId
    //         })
    
    //         const reply = new TrainingReply.Model({
    //             uuid: generateUUID(),
    //             topicId,
    //             profile: studentProfile._id,
    //             message: {
    //                 type,
    //                 data,
    //                 taskId,
    //             },
    //             sender: studentId,
    //             date: getCurrentUTCTime()
    //         })
    
    //         const saved = await reply.save()
    
    //         return res.status(200).json({
    //             message: 'Answer saved.',
    //             answer: saved
    //         })   

    //     } catch (error) {
    //         return res.status(500).json({
    //             message: 'Add answer error: something went wrong.',
    //             answer: req.body
    //         })
    //     }
    // }

    // addCheck = async (req, res) => {
    //     const { check } = req.body

    //     console.log();
    // }

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

    getProfile = async (params) => {
        const { trainingId, studentId, fields } = params

        const query = {
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