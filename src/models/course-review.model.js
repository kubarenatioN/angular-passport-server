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

module.exports = mongoose.model('CourseReview', schema, 'courseReviews')