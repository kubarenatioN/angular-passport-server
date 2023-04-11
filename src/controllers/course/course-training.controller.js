const CourseTraining = require('../../models/course-training.model')

class CourseTrainingController {
      
    get = async (params) => {
        const { authorId, coursesIds, studentId, fields } = params

        try {
            const trainings = await CourseTraining.Model.find({
                courseId: coursesIds
            }).populate({
                path: 'course',
                select: fields
            })

            return trainings
        } catch (error) {
            throw new Error('Error getting trainings.')
        }
    }

    getCourses = async (params) => {
        const { authorId, coursesIds, studentId, fields } = params

        try {
            const trainings = await this.get(params)
            // const courses = await CourseTraining.



            return trainings
        } catch (error) {
            throw new Error('Error getting trainings.')
        }
    }

}

const controller = new CourseTrainingController()

module.exports = controller