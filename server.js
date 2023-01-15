const express = require('express')
const { authRouter } = require('./routes/auth.js')
const { cardsRouter } = require('./routes/cards.js')
const cors = require('cors')

require('./config/passport.js')

const app = express()

app.use(cors())
app.use(express.json())

const PORT = 5000;

app.use('/auth', authRouter)
app.use('/cards', cardsRouter)

app.listen(PORT, () => {
    console.log(`Server is running...`);
})

