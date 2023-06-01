const mongoose = require('mongoose')
const Types = mongoose.Schema.Types

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
        unique: true,
    },
	user: {
		type: Types.ObjectId,
		ref: 'User',
		required: true,
	},
	motivation: {
		type: String,
		required: true,
	},
	files: {
		type: Array,
	},
	status: {
		type: String,
		enum: ['pending', 'approved', 'rejected'],
		required: true,
		default: 'pending'
	}
})

const model = mongoose.model('TeacherRequest', schema, 'teacherRequests')

module.exports = {
    Model: model,
}