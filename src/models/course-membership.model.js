const mongoose = require('mongoose')
const Types = mongoose.Schema.Types
const User = require('../models/user.model')

const schema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    courseId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'pending'
    },
})

const model = mongoose.model('CourseMembership', schema, 'coursesMembership')

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