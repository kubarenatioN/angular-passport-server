const { enrollStatuses } = require('../constants/common.constants')
const { generateUUID } = require('../helpers/common.helper');
const { getCurrentUTCTime } = require('../helpers/time.helper');

const CourseMembership = require('../models/course-membership.model');
const TrainingProfile = require('../models/training/training-profile.model');
const TrainingReply = require('../models/training/training-reply.model');

class TrainingController {

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

    addAnswer = async (req, res) => {
        const { answer, topicId, trainingId, studentId } = req.body
        const { type, data, taskId } = answer

        try {
            const studentProfile = await this.getProfile({
                trainingId,
                studentId
            })
    
            const reply = new TrainingReply.Model({
                uuid: generateUUID(),
                topicId,
                profile: studentProfile._id,
                message: {
                    type,
                    data,
                    taskId,
                },
                sender: studentId,
                date: getCurrentUTCTime()
            })
    
            const saved = await reply.save()
    
            return res.status(200).json({
                message: 'Answer saved.',
                answer: saved
            })   

        } catch (error) {
            return res.status(500).json({
                message: 'Add answer error: something went wrong.',
                answer: req.body
            })
        }
    }

    addCheck = async (req, res) => {
        const { check } = req.body

        console.log();
    }

    isAvailableForUser = async (req, res) => {
        const { userId, courseId } = req.body

        const record = await CourseMembership.Model.findOne({
            userId: String(userId),
            courseId
        })

        return res.status(200).json({
            isAvailable: record && record.status === enrollStatuses.approved,
            record
        })
    }

    getProfile = async ({ trainingId, studentId }) => {        
        const studentProfile = await TrainingProfile.Model.findOne({
            training: trainingId,
            student: studentId
        }).populate({
            path: 'training',
            model: 'CourseTraining',
            populate: {
                path: 'course',
                model: 'Course',
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