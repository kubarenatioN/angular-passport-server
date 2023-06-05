const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;

const schema = new mongoose.Schema({
    uuid: {
      required: true,
      type: String,
      unique: true,
    },
    profile: {
      required: true,
      type: Types.ObjectId
    },
    summary: {
      score: {
        type: Number,
      },
    },
    date: {
      type: String,
    },
});

const model = mongoose.model('TrainingResult', schema, 'trainingResults');

module.exports = {
    Model: model,
};
