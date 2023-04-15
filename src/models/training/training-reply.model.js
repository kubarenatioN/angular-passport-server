const mongoose = require('mongoose')
const Types = mongoose.Schema.Types

const replyTaskAnswerSchema = new mongoose.Schema({
    taskId: {
        type: String,
    },
    comment: {
        type: String,
    },
    files: {
        type: Types.Array,
        required: true,
    },
})

const replyReportSchema = new mongoose.Schema({
    report: {
        type: String,
    },
})

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
        unique: true,
    },
    type: {
        type: String,
        enum: ['task', 'report', 'test', 'check'],
        required: true,
    },
    taskId: {
        type: String,
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
        type: Types.Mixed,
        enum: [replyTaskAnswerSchema, replyReportSchema]
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