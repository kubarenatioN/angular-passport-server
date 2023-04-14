const mongoose = require('mongoose')
const Types = mongoose.Schema.Types
const User = require('./user.model')

const schema = new mongoose.Schema({
    student: {
        type: Types.ObjectId,
        required: true,
        ref: 'User'
    },
    training: {
        type: Types.ObjectId,
        required: true,
        ref: 'CourseTraining'
    },
    status: {
        type: String,
        required: true,
        default: 'pending'
    },
})

const model = mongoose.model('TrainingMembership', schema, 'trainingsMembership')

module.exports = {
    Model: model,

    getWithUsers: async (members) => {
        const membersUsersIds = members.map(m => m.userId)

        const users = await User.Model.find({
            uuid: { $in: membersUsersIds }
        })

        return members.map(membership => {
            return {
                ...membership._doc,
                user: users.find(u => u.uuid === membership.userId)
            }
        })
    }
}