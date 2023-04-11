const CourseTraining = require('../../models/course-training.model')

class CourseTrainingController {
      
    get = async (params) => {
        const { coursesIds, fields, uuid } = params

        try {
            const trainings = await CourseTraining.Model.find({
                $or: [
                    { courseId: coursesIds },
                    { uuid },
                ]
            }).populate({
                path: 'course',
                select: fields
            })

            return trainings
        } catch (error) {
            throw new Error('Error getting trainings.')
        }
    }

    

}

const controller = new CourseTrainingController()

module.exports = controller