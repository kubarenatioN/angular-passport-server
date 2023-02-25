function isAdmin(req, res, next) {
    console.log('is admin', req.user);
    const { role } = req.user
    if (role === 'admin') {
        return next()
    }

    return res.status(403).json({
        message: 'No permission for not admin users.',
        code: 'NOT-ADMIN'
    })
}

module.exports = isAdmin