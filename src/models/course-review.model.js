const mongoose = require('mongoose')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
    },
    masterId: {
        type: Types.ObjectId
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
    comments: {
        required: true,
        type: Object,
    },
    status: {
        required: true,
        type: String,
    },   
})

const model = mongoose.model('CourseReview', schema, 'courseReviews')

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
            throw new Error('Error getting review courses')
        }
    },
    create: async (data, options) => {

        const newRecord = new model({
            ...data
        })

        return newRecord.save();
    }
}