

const mongoose = require('../libs/mongo') // une instance unique et déjà connectée de moogoose

const User = mongoose.model('User', {
  email: String,
  account: {
    username: String,
    avatar: Object, 
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
})

module.exports = User