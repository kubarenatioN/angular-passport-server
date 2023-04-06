const mongoose = require('mongoose')
const { userRoles } = require('../constants/common.constants')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
        unique: true,
    },
    email: {
        required: true,
        type: String,
        unique: true,
    },
    username: {        
        required: true,
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    salt: {
        type: String,
    },
    role: {
        required: true,
        type: String,
        default: userRoles.student
    },
    photo: {
        type: String,
    },
    socialType: {
        type: String
    },
    socialId: {
        type: String
    },
})

const model = mongoose.model('User', schema, 'users')

module.exports = {
    Model: model,
}