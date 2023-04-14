const { enrollStatuses } = require('../constants/common.constants')
const { generateUUID } = require('../helpers/common.helper')
const TrainingProfile = require('../models/training/training-profile.model')

// trainingId - Mongo ObjectId
// studentId - Mongo ObjectId

class CourseMembershipController {

    lookup = async (req, res) => {
        const { trainingId, studentsIds } = req.body
        
        try {
            const records = await TrainingProfile.Model.find({
                student: studentsIds,
                training: trainingId
            })
    
            return res.status(200).json({
                message: 'Succeed lookup',
                data: records,
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Lookup Error',
                data: [],
                error,
            })
        }
        
    }

    getMembersProfiles = async (req, res) => {
        const { type, trainingId, enrollment, size, page, populate } = req.body

        try {
            if (type === 'list' && size != null) {
                const skip = size === -1 ? 0 : size * (page ?? 0)
                const limit = size === -1 ? 0 : size

                const members = await TrainingProfile.Model.find({
                    training: trainingId,
                    enrollment,
                })
                .skip(skip)
                .limit(limit)
                .populate(populate)
    
                return res.status(200).json({
                    message: 'Success',
                    data: members,
                })
            }

            return res.status(404).json({
                message: 'Cannot get members with such request.',
                data: []
            })
        } catch (error) {
            console.error('Get Training Profiles Error:', error);
            return res.status(500).json({
                message: 'Error getting training members.',
                data: null,
                error
            })
        }
    }

    createEnroll = async (req, res) => {
        const { studentsIds, trainingId } = req.body
        const { action } = req.query

        try {
            const enrolled = await this._enroll(studentsIds, trainingId)
    
            return res.status(200).json({
                message: 'Enrollment created',
                data: enrolled,
                action,
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error handling enrollment.',
                error
            })
        }
    }

    updateEnroll = async (req, res) => {
        const { trainingId, studentsIds, status } = req.body

        try {
            const records = await TrainingProfile.Model.updateMany({
                training: trainingId,
                student: studentsIds
            }, {
                enrollment: status
            })
    
            return res.status(200).json({
                message: 'Enrollment updated',
                enrollment: status,
                records
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error enrollment update',
                enrollment: status,
            })            
        }
        
    }

    _enroll = async (studentsIds, trainingId) => {
        const existed = await TrainingProfile.Model.find({
            student: studentsIds,
            training: trainingId,
        })
        if (existed.length > 0) {
            console.log('Some users already enrolled');
            throw new Error()
        }
        
        const records = studentsIds.map(studentId => ({
            uuid: generateUUID(),
            student: studentId,
            training: trainingId,
            enrollment: enrollStatuses.pending
        }))
        const inserted = await TrainingProfile.Model.insertMany(records)

        return inserted
    }

    _deleteEnroll = async (studentsIds, trainingId) => {
        const removed = await TrainingProfile.Model.deleteMany({
            student: studentsIds,
            training: trainingId
        })

        return {
            removed,
            studentsIds,
            trainingId,
        };
    }
}

const controller = new CourseMembershipController()
module.exports = controller