const { nanoid } = require('nanoid')

const generateUUID = () => {
    return nanoid()
}

module.exports = { generateUUID }