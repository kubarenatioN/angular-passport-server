const CourseReview = require('../models/course-review.model')
const { getCurrentUTCTime } =  require('../helpers/time.helper')

class CourseReviewController {

    createVersion = async (req, res) => {
        const { course, isMaster } = req.body

        const createdAt = getCurrentUTCTime();
		const masterId = isMaster ? null : course.masterId;
        
        try {
            const data = CourseReview.create({
                ...course,
                createdAt,
                masterId,    
            })

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

    get = async (req, res) => {
        
    }

    select = async (options) => {
        const { authorId, coursesIds, fields } = options
        const data = await CourseReview.get({
            ids: coursesIds ?? [],
            fields,
            authorId
        })

        return data
    }

    getById = async (req, res) => {

    }

}

const controller = new CourseReviewController()

module.exports = controller