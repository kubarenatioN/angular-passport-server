const { generateUUID } = require("../../helpers/common.helper")
const { getCurrentUTCTime } = require("../../helpers/time.helper")
const CourseFeedback = require("../../models/course-feedback.model")

const defaultPopulate = [
	{
		path: 'author',
		model: 'User',
	},
	{
		path: 'course',
		model: 'Course',
		select: ['uuid', 'title', 'authorId']
	},
	{
		path: 'training',
		model: 'CourseTraining',
	},
]

class CourseFeedbackController {

	get = async (req, res) => {
		const { courseId, trainingId } = req.query

		try {
			const query = {
				course: courseId
			}
	
			if (trainingId) {
				query['training'] = trainingId
			}
	
			const data = await CourseFeedback.Model.find(query).sort({
				date: 'asc'
			}).populate(defaultPopulate)
	
			return res.status(200).json({
				origin: 'Course feedbacks',
				data
			})
		} catch (error) {
			return res.status(500).json({
				origin: 'Course feedbacks',
				data: null,
				error,
			})
		}
		
	}

	create = async (req, res) => {
		const { text, rating, courseId, trainingId, authorId } = req.body

		try {
			const feedback = await (new CourseFeedback.Model({
				uuid: generateUUID(),
				text,
				rating,
				course: courseId,
				training: trainingId,
				author: authorId,
				date: getCurrentUTCTime()
			})).save()

			const created = await CourseFeedback.Model.findOne({
				_id: feedback._id
			}).populate(defaultPopulate)

			return res.status(201).json({
				origin: 'Course feedbacks',
				created
			})

		} catch (error) {
			return res.status(500).json({
				origin: 'Course feedbacks',
				error,
			})			
		}
	}

}

const controller = new CourseFeedbackController()

module.exports = controller