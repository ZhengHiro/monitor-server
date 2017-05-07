var mongoose = require('mongoose');
var Schema = new mongoose.Schema({
    address: String,
    dateTime: Number,
    totalTime: Number,
    remoteTime: Number,
    localTime: Number,
    workingTime: Number,
    studyTime: Number,
    gameTime: Number
});
module.exports = mongoose.model('time_info', Schema);