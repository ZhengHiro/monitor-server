var mongoose = require('mongoose');
var Schema = new mongoose.Schema({
    address: String,
    time: Number,
    remoteable: Number,
    status: Number,
    isWorking: Number
});
module.exports = mongoose.model('online_info', Schema);