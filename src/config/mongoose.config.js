const mongoose = require('mongoose')
require('dotenv').config()

const { MONGO_CONNECT } = process.env

mongoose.connect(MONGO_CONNECT)

const db = mongoose.connection

db.on('error', (error) => {
    console.log(`Failed to connect`, error);
})

db.on('connected', () => {
    console.log(`Connected to MongoDB`);
})

module.exports = db;