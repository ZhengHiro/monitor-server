var mongoose = require('mongoose');
var Schema = new mongoose.Schema({
    address: String,
    dateTime: Number,
    processName: String,
    totalMem: Number
});
module.exports = mongoose.model('process_rate', Schema);