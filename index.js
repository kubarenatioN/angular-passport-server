const express = require('express')
const { Router } = require('express')
const cors = require('cors')
require('dotenv').config()
require('./src/config/passport')
const authRouter = require('./src/routes/auth.router')
const coursesRouter = require('./src/routes/course.router')
const adminRouter = require('./src/routes/admin.router')
const userRouter = require('./src/routes/user.router')
const uploadRouter = require('./src/routes/upload.router')
const trainingRouter = require('./src/routes/training.router')
const isAdmin = require('./src/middlewares/admin.middlewares')
const authenticate = require('./src/middlewares/authenticate.middleware')

const app = express()
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
app.use('/static', express.static('public'))
 
const apiRouter = Router()
apiRouter.use('/courses', coursesRouter)
apiRouter.use('/training', trainingRouter)
// apiRouter.use('/boards', boardsRouter)

app.use('/api', apiRouter)
app.use('/user', userRouter)
app.use('/auth', authRouter)
app.use(
    '/admin',
    authenticate(),
    isAdmin,
    adminRouter
)
app.use('/upload', uploadRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
})

