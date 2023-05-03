const mongoose = require('mongoose')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
        unique: true,
    },
    title: {
        required: true,
        type: String,
    },
    description: {
        required: true,
        type: String,
    },
    authorId: {
      required: true,
      type: Types.ObjectId,
      ref: 'User',
    },
    courses: {
        required: true,
        type: [Types.ObjectId],
        ref: 'Course',
    },
    trainings: {
        required: true,
        type: [Types.ObjectId],
        ref: 'CourseTraining',
        default: [],
    }
})

const model = mongoose.model('CoursesBundle', schema, 'coursesBundles')

module.exports = {
    Model: model,
}