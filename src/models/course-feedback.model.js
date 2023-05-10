const mongoose = require('mongoose')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
        unique: true,
    },
    text: {
        required: true,
        type: String,
    },
    rating: {
        type: Number,
        required: false,
    },
    author: {
      required: true,
      type: Types.ObjectId,
      ref: 'User',
    },
    course: {
        required: true,
        type: Types.ObjectId,
        ref: 'Course',
    },
    training: {
        type: Types.ObjectId,
        ref: 'CourseTraining',
    },
    date: {
        type: String,
        required: true
    }
})

const model = mongoose.model('CourseFeedback', schema, 'courseFeedbacks')

module.exports = {
    Model: model,
}