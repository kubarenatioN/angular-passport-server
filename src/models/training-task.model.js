const mongoose = require('mongoose')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
        unique: true,
    },
    training: {
        required: true,
        type: Types.ObjectId,
        ref: 'Training'
    },
    topicId: {
        required: true,
        type: String,
    },
    task: {
        id: {
            required: true,
            type: String,
        },
        taskDescr: {
            required: true,
            type: String,
        },
        materials: {
            // required: true,
            type: Array,
        },
        type: {
            required: true,
            type: String,
            enum: ['common', 'personal'],
            default: 'personal'
        }
    },
    authorId: {
        required: true,
        type: Types.ObjectId,
        ref: 'User'
    },
})

const model = mongoose.model('TrainingTask', schema, 'trainingTasks')

module.exports = {
    Model: model,
}