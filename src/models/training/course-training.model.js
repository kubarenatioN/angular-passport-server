const mongoose = require('mongoose')
const { generateUUID } = require('../../helpers/common.helper')
const { getCurrentUTCTime } = require('../../helpers/time.helper')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        required: true,
        type: String,
    },
    course: {
        type: Types.ObjectId,
        ref: 'Course'
    },
    courseId: {
        required: true,
        type: String,
    },
    startAt: {
        required: true,
        type: String,
    },
    status: {
        required: true,
        type: String,
        enum: ['active', 'archived'],
    },
})

const model = mongoose.model('CourseTraining', schema, 'courseTrainings')

module.exports = {
    Model: model,

    createFromNewCourse: async (uuid, course, startAt) => {
        const training = new model({
            uuid,
            courseId: course.uuid,
            course: course._id,
            status: 'active',
            startAt,
        })
        return (await training.save())._doc
    },

    startFromCourse: async (course, startAt) => {
        const training = await new model({
            uuid: generateUUID(),
            title: course.title,
            courseId: course.uuid,
            course: course._id,
            status: 'active',
            startAt,
        }).save()
        return training
    }
}