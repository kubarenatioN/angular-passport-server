const isTeacher = (req, res, next) => {
    const { permission } = req.user
    if (permission === 'teacher') {
        return next()
    }

    return res.status(403).json({
        message: 'No permission for not teacher users.',
        code: 'NOT-TEACHER'
    })

}

module.exports = isTeacher