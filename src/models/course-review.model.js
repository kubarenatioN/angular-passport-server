const mongoose = require('mongoose')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
        unique: true,
    },
    masterId: {
        type: String
    },
    title: {
        required: true,
        type: String,
    },
    description: {
        required: true,
        type: String,
    },
    banner: {
        type: String,
    },
    authorId: {
        required: true,
        type: String,
    },
    modules: {
        required: true,
        type: Object,
    },
    createdAt: {
        required: true,
        type: String,
    },
    category: {
        // required: true,
        type: String,
    },
    competencies: {
        // required: true,
        type: Object,
    },
    comments: {
        required: true,
        type: Object,
    },
    status: {
        required: true,
        type: String,
        default: 'ReadyForReview'
    },
})

const model = mongoose.model('CourseReview', schema, 'courseReviews')

module.exports = {
    Model: model,

    select: async (options) => {
        try {
            const { ids, fields, authorId } = options
            const query = {}
            if (ids && ids.length > 0) {
                query['uuid'] = ids
            }
            if (authorId) {
                query['authorId'] = authorId
            }

            const data = await model
                .find(query)
                .select(fields)

            return data
        } catch (error) {
            throw new Error('Error getting review courses')
        }
    },

    get: async (id) => {
        const record = await model.findById(id)
        return record
    },

    getByUUID: async (uuid) => {
        const record = await model.findOne({ uuid })
        return record
    },

    create: async (data, options) => {

        const newRecord = new model({
            ...data
        })

        return newRecord.save();
    },

    history: async ({ masterId, fields }) => {
        const historyChain = await model
            .find({
                $or: [
                    { masterId },
                    { uuid: masterId }
                ]
            })
            .sort({ _id: -1 })
            .select(fields)

        return historyChain
    }
}