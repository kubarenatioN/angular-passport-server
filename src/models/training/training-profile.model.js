const mongoose = require('mongoose')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
        unique: true,
    },
    training: {
        type: Types.ObjectId,
        required: true,
        ref: 'CourseTraining'
    },
    student: {
        type: Types.ObjectId,
        required: true,
        ref: 'User'
    },
    enrollment: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        required: true,
    },
    status: {
        type: String,
        enum: ['completed', 'active'],
        default: 'active',
    }
})

const model = mongoose.model('TrainingProfile', schema, 'trainingProfiles')

module.exports = {
    Model: model,
}