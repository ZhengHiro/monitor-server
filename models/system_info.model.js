var mongoose = require('mongoose');
var Schema = new mongoose.Schema({
    address: String,
    time: Number,
    memory: Number,
    cpuUsed: Number
});
module.exports = mongoose.model('system_info', Schema);