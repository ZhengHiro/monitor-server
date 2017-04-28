var mongoose = require('mongoose');
var Schema = new mongoose.Schema({
    address: String,
    time: Number,
    addProcess: Array,
    delProcess: Array,
    process: Array
});
module.exports = mongoose.model('process_info', Schema);