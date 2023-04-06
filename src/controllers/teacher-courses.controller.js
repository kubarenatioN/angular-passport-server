const model = require('../models/course-review.model')
const { getCurrentUTCTime } =  require('../helpers/time.helper')

class TeacherCoursesController {

    createVersion = async (req, res) => {
        const { course, isMaster } = req.body

        const createdAt = getCurrentUTCTime();
		const masterId = isMaster ? null : course.masterId;

        const newReview = new model({
            ...course,
            createdAt,
            masterId,
        })
        
        try {
            const data = newReview.save()

            if (!isMaster) {
                // Update current record status
            }
            
            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json({
                operation: 'CREATE_REVIEW_VERSION',
                message: 'Error while saving data.'
            })
        }
    }
    
    updateMembership = async (req, res) => {
        const { status, usersIds, courseId } = req.body
        return res.json({message: 'updateMembership', status})
    }

}

const controller = new TeacherCoursesController()
module.exports = controller