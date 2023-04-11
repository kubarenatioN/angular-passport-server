const mongoose = require('mongoose')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    course: {
        type: Types.ObjectId,
        ref: 'Course'
    },
    courseId: {
        required: true,
        type: String,
    },
    startAt: {
        required: true,
        type: String,
    },
    status: {
        required: true,
        type: String,
        default: 'active'
    }
})

const model = mongoose.model('CourseTraining', schema, 'courseTrainings')

module.exports = {
    Model: model,

    // withCourses: async (ids) => {
    //     const courses = 
    // }
}