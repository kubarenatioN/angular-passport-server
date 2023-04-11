const CourseReview = require('../../models/course-review.model')
const { getCurrentUTCTime } =  require('../../helpers/time.helper')
const { reviewStatuses } = require('../../constants/common.constants')

class CourseReviewController {

    createVersion = async (req, res) => {
        const { course, isMaster } = req.body

        const createdAt = getCurrentUTCTime();
		const masterId = isMaster ? null : course.masterId;
        const parentId = course._id
        
        try {
            delete course._id
            const data = await CourseReview.create({
                ...course,
                createdAt,
                masterId,
                status: reviewStatuses.readyForReview  
            })

            if (!isMaster) {
                const parentVersion = await CourseReview.get(parentId)
                if (parentVersion) {
                    parentVersion.status = reviewStatuses.reviewed

                    await parentVersion.save()
                }
            }
            
            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json({
                operation: 'CREATE_REVIEW_VERSION',
                message: 'Error while saving data.',
                error
            })
        }
    }

    updateVersion = async (req, res) => {
        const { id, comments } = req.body
        const { overallComments, modules } = comments

        const reviewVersion = await CourseReview.get(id)
        if (!reviewVersion) {
            return res.status(200).json({
                message: 'Nothing was updated. No record found by _id provided.'
            })
        }
        reviewVersion.modules = modules
        reviewVersion.comments = overallComments
        reviewVersion.status = reviewStatuses.readyForUpdate
        const updated = await reviewVersion.save()
        return res.status(200).json({
            message: 'Update successfully',
            updated
        })
    }

    getHistory = async (req, res) => {
        const { masterId, fields } = req.body
        
        try {
            const data = await CourseReview.history({
                masterId,
                fields
            })
            
            return res.status(200).json({
                versions: data
            })
        } catch (error) {
            return res.status(500).json({
                operation: 'GET_REVIEW_HISTORY',
                message: 'Error while getting review history.'
            })
        }
    }

    select = async (options) => {
        const { authorId, coursesIds, fields } = options
        const data = await CourseReview.select({
            ids: coursesIds ?? [],
            authorId,
            fields
        })

        return data
    }

}

const controller = new CourseReviewController()

module.exports = controller