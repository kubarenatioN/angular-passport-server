const { enrollStatuses } = require('../../constants/common.constants')
const CourseMembership = require('../../models/course-membership.model')

class CourseMembershipController {

    lookup = async (req, res) => {
        const { courseId, usersIds } = req.body
        
        const records = await CourseMembership.Model.find({
            userId: usersIds,
            courseId
        })

        return res.status(200).json({
            data: records,
            action: 'lookup'
        })
    }

    getMembers = async (req, res) => {
        const { type, courseId, status, size, page } = req.body

        if (type === 'list' && size != null && page != null) {
            const members = await CourseMembership.Model.find({
                courseId,
                status,
            }).skip(page * size).limit(size)

            const data = await CourseMembership.getWithUsers(members)

            return res.status(200).json({
                message: 'Success',
                data,
            })
        }

        return res.status(404).json({
            message: 'Cannot get members with such request.',
            data: []
        })
    }

    handleEnroll = async (req, res) => {
        const { usersIds, courseId } = req.body
        const { action } = req.query

        if (action === 'enroll') {
            const enrolled = await this._enroll(usersIds, courseId)

            return res.status(200).json({
                message: 'Enrolled',
                data: enrolled,
                action,
            })
        }
        else if (action === 'cancel' || action === 'leave') {
            const deleted = await this._deleteEnroll(usersIds, courseId)
            return res.status(200).json({
                message: 'Enrolled',
                data: deleted,
                action,
            })
        }

        return res.status(200).json({
            message: 'No enroll status changes were made.'
        })
    }

    updateEnroll = async (req, res) => {
        const { courseId, usersIds, status } = req.body

        const records = await CourseMembership.Model.updateMany({
            courseId,
            userId: usersIds
        }, {
            status
        })

        return res.status(200).json({
            message: 'Updated enroll',
            status,
            records
        })
    }

    _enroll = async (usersIds, courseId) => {
        const existed = await CourseMembership.Model.find({
            userId: usersIds,
            courseId,
        })
        if (existed.length > 0) {
            return res.status(404).json({
                message: 'Some users already enrolled',
                users: existed
            })
        }
        
        const records = usersIds.map(userId => ({
            userId,
            courseId,
            status: enrollStatuses.pending
        }))
        const inserted = await CourseMembership.Model.insertMany(records)

        return inserted
    }

    _deleteEnroll = async (usersIds, courseId) => {
        const removed = await CourseMembership.Model.deleteMany({
            userId: usersIds,
            courseId
        })

        return {
            ...removed,
            usersIds,
            courseId,
        };
    }
}

const controller = new CourseMembershipController()
module.exports = controller