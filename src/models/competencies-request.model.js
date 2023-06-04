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
	competencies: {
		type: Array,
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

const model = mongoose.model('CompetenciesRequest', schema, 'competenciesRequest')

module.exports = {
    Model: model,
}