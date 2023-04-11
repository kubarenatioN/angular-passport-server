const CourseMembership = require('../models/course-membership.model');
const { enrollStatuses } = require('../constants/common.constants')
class TrainingController {

    addAnswer = async (req, res) => {
        const { answer } = req.body

        
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