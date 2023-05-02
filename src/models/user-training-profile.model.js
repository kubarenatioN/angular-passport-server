const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;

const schema = new mongoose.Schema({
    uuid: {
        required: true,
        type: String,
        unique: true,
    },
    competencies: {
        type: [String],
    },
    finishedTrainigns: {
        type: [Types.ObjectId]
    }
});

const model = mongoose.model('UserTrainingProfile', schema, 'usersTrainingProfiles');

module.exports = {
    Model: model,
};
