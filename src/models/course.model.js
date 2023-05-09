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
        type: String,
    },
    modules: {
        required: true,
        type: Object,
    },
    topics: {
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
        type: {
            acquired: {
                type: [String]
            },
            required: {
                type: [String]
            },
        },
    },
    score: {
        type: Number,
        required: true,
    },
    bundle: {
        required: false,
        type: Types.ObjectId,
    },
})

const model = mongoose.model('Course', schema, 'courses')

module.exports = {
    Model: model,
    get: async (options) => {
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
            throw new Error('Error getting published courses')
        }
    },
    create: async (data, options) => {
        const { topics } = data

        const tasks = []
        const tests = []
        topics.forEach((topic) => {
            if (topic.practice) {
                tasks.push(...topic.practice.tasks)
            }
            if (topic.testLink) {
                tests.push(topic.testLink)
            }
        })
        const score = tasks.length * 100 + tests.length * 100

        const newRecord = new model({
            ...data,
            score
        })

        return newRecord.save();
    }
}