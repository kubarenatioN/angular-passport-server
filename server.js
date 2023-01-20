const express = require('express')
const { authRouter } = require('./routes/auth.router.js')
const { cardsRouter } = require('./routes/cards.router.js')
const cors = require('cors')

require('dotenv').config()
require('./config/passport.js')

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000;

app.use('/auth', authRouter)
app.use('/api', cardsRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
})

