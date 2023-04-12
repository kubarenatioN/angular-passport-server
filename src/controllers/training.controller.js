const { enrollStatuses } = require('../constants/common.constants')
const { generateUUID } = require('../helpers/common.helper');
const { getCurrentUTCTime } = require('../helpers/time.helper');

const CourseMembership = require('../models/course-membership.model');
const TrainingProfile = require('../models/training/training-profile.model');
const TrainingReply = require('../models/training/training-reply.model');

class TrainingController {

    addAnswer = async (req, res) => {
        const { answer, topicId, trainingId, studentId } = req.body
        const { type, data, taskId } = answer

        try {
            let studentProfile = await TrainingProfile.Model.findOne({
                training: trainingId,
                student: studentId
            })
    
            if (!studentProfile) {
                const newProfile = new TrainingProfile.Model({
                    uuid: generateUUID(),
                    training: trainingId,
                    student: studentId    
                })
                studentProfile = await newProfile.save()
            }
    
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

}

const controller = new TrainingController()
module.exports = controller