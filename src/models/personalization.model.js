const mongoose = require('mongoose')
const TrainingTask = require('./training-task.model')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
        unique: true,
    },
    type: {
        required: true,
        type: String,
        enum: ['assignment', 'dismiss', 'open'],
    },
    profile: {
        required: true,
        type:  Types.ObjectId,
        ref: 'TrainingProfile'
    },
    task: {
        type: Types.ObjectId,
        ref: 'TrainingTask'
    },
    dismiss: {
        type: String,
    },
    open: {
        type: String,
    }
})

const model = mongoose.model('Personalization', schema, 'personalization')

module.exports = {
    Model: model,
}