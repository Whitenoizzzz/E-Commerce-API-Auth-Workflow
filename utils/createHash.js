const crypto = require('crypto')

const hashString = (string) => crypto.createHash(string).update(string).digest('hex')

module.exports = hashString