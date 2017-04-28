var mongoose = require('mongoose');
var Schema = new mongoose.Schema({
    index: Number,
    address: String,
    nickname: String,
    group: Number,
    lastOnline: Number,
    remoteTime: Number,
    localTime: Number
});
module.exports = mongoose.model('computer_info', Schema);