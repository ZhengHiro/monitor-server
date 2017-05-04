var mongoose = require('mongoose');
var Schema = new mongoose.Schema({
    index: Number,
    address: String,
    nickname: String,
    group: String,
    lastOnline: Number,
    remoteTime: Number,
    localTime: Number,
    isWorking: Boolean
});
module.exports = mongoose.model('computer_info', Schema);