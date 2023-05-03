const mongoose = require('mongoose')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true
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
        default: 'active'
    },
    bundle: {
        required: false,
        type: Types.ObjectId,
    }
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
    }
    // withCourses: async (ids) => {
    //     const courses = 
    // }
}