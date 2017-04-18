var comongo = require('co-mongo');
var co = require('co');
var config = require('../config.js');
var monk = require('monk');

if (config.mongo) {
	co(function* () {
		if (config.mongo.user) {
			module.exports = monk(config.mongo.user+':'+config.mongo.pwd+'@'+config.mongo.host+':'+config.mongo.port+'/'+config.mongo.database);
		} else {
			module.exports = monk(config.mongo.host+':'+config.mongo.port+'/'+config.mongo.database);
		}
	});
}
