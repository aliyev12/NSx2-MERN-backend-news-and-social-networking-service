const mongoose = require('mongoose');

mongoose.set('debug', true);
mongoose.Promise = Promise;
mongoose.connect(process.env.DATABASE_CONNECTION_URL, {
    useNewUrlParser: true,
    keepAlive: true
});

module.exports.User = require('./user');
module.exports.Message = require('./message');