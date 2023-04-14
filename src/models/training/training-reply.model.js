const mongoose = require('mongoose')
const Types = mongoose.Schema.Types

const replyMessageSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['task', 'report', 'test', 'check'],
        required: true,
    },
    data: {
        type: Object,
        required: false
    },
    taskId: {
        type: String,
    },
})

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
        unique: true,
    },
    topicId: {
        type: String,
        required: true,
    },
    profile: {
        type: Types.ObjectId,
        required: true,
        ref: 'TrainingProgress'
    },
    message: {
        required: true,
        type: replyMessageSchema
    },
    sender: {
        type: Types.ObjectId,
        required: true,
        ref: 'User'
    },
    date: {
        type: String,
        required: true,
    }
})

const model = mongoose.model('TrainingReply', schema, 'trainingDiscussion')

module.exports = {
    Model: model,
}