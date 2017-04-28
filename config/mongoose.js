var mongoose = require('mongoose');
var config = require('./config.js');

module.exports = function(){
    var db = mongoose.connect(config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database);
    require('../models/');
    return db;
}();