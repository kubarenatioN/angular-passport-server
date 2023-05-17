const { nanoid } = require('nanoid')
const path = require('path')

const generateUUID = () => {
    return nanoid()
}

const getFilenameWithTimestamp = (filename, timestamp) => {
    if (!timestamp) {
        return filename
    }
    const { name, ext } = path.parse(filename)
    return `${name}-${timestamp}${ext}`
}

module.exports = { generateUUID, getFilenameWithTimestamp }