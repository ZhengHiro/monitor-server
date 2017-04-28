var mongoose = require('mongoose');
var Schema = new mongoose.Schema({
    address: String,
    time: Number,
    targetName: String
});
module.exports = mongoose.model('screen_info', Schema);