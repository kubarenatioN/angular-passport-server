const mongoose = require('mongoose')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
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
        type: Number,
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
        required: true,
        type: String,
    },
    competencies: {
        required: true,
        type: Object,
    },
    isActive: {
        type: Boolean
    }   
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
            console.log(data);
            return data
        } catch (error) {
            throw new Error('Error getting published courses')
        }
    },
    create: async (data, options) => {

        const newRecord = new model({
            ...data
        })

        return newRecord.save();
    }
}