const express = require('express')
const cors = require('cors')
const { connectDB } = require('./src/config/mongoose.config')
const routesInit = require('./routes.init')
require('dotenv').config()
require('./src/config/passport')

const path = require('path')

const app = express()
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
app.use('/static', express.static('public'))

// Initialize routing
routesInit(app)

globalThis.appRoot = path.resolve(__dirname)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}...`);
    })
})

