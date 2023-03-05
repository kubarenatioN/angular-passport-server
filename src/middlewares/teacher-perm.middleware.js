const isTeacher = (req, res, next) => {
    const { role } = req.user
    if (role === 'teacher') {
        return next()
    }

    return res.status(403).json({
        message: 'No permission for not teacher users.',
        code: 'NOT-TEACHER'
    })

}

module.exports = isTeacher