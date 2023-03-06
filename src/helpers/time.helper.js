function getCurrentUTCTime() {
    return new Date().toUTCString()
}

module.exports = { getCurrentUTCTime }