var mongoose = require('mongoose');
var Schema = new mongoose.Schema({
    address: String,
    time: Number,
    type: String
});
module.exports = mongoose.model('switch_info', Schema);