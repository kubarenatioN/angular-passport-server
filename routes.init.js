const { Router } = require('express')
const authRouter = require('./src/routes/auth.router')
const coursesRouter = require('./src/routes/course/course.router')
const adminRouter = require('./src/routes/admin.router')
const userRouter = require('./src/routes/user.router')
const uploadRouter = require('./src/routes/upload.router')
const trainingRouter = require('./src/routes/training.router')
const personalizationRouter = require('./src/routes/personalization.router')
const isAdmin = require('./src/middlewares/admin.middlewares')
const authenticate = require('./src/middlewares/authenticate.middleware')

function init(app) {
    const apiRouter = Router()
    apiRouter.use('/courses', coursesRouter)
    apiRouter.use('/training', trainingRouter)
    apiRouter.use('/personalization', personalizationRouter)
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
}

module.exports = init