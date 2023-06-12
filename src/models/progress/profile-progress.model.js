const mongoose = require('mongoose')
const Types = mongoose.Schema.Types
const { generateUUID } = require('../../helpers/common.helper')

const profileProgressRecordSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        default: () => generateUUID()
    },
    taskId: {
        type: String,
        required: true
    },
    mark: {
        type: Number,
        required: true
    },
    isCounted: {
        type: Boolean,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: false
    }
})

const profileQuizRecordSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
    },
    mark: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
})

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
        unique: true,
        default: () => generateUUID()
    },
    profile: {
        type: Types.ObjectId,
        required: true,
        ref: 'TrainingProfile',
    },
    topicId: {
        type: String,
        required: true
    },
    records: {
        type: [profileProgressRecordSchema]
    },
    quiz: {
        type: [profileQuizRecordSchema]
    },
    bestScore: {
        type: Types.Number,
        required: true,
        default: 0,
    },
    lastScore: {
        type: Types.Number,
        required: true,
        default: 0,
    }
})

const model = mongoose.model('ProfileProgress', schema, 'profileProgress')

module.exports = {
    Model: model,
}