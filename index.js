const express = require('express')
const { Router } = require('express')
const cors = require('cors')
require('dotenv').config()
require('./src/config/passport')
const authRouter = require('./src/routes/auth.router')
const cardsRouter = require('./src/routes/cards.router')
const coursesRouter = require('./src/routes/course.router')
const adminRouter = require('./src/routes/admin.router')

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000;


const apiRouter = Router()
apiRouter.use('/cards', cardsRouter)
apiRouter.use('/courses', coursesRouter)
app.use('/api', apiRouter)
app.use('/auth', authRouter)
app.use('/admin', adminRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
})

