var app = require('koa')()
  , koa = require('koa-router')()
  , logger = require('koa-logger')
  , json = require('koa-json')
  , views = require('koa-views')
  , mount = require('koa-mount')
  , onerror = require('koa-onerror')
  , session = require('koa-generic-session')
  , redisStore = require('koa-redis')
  , log = require('bt-co-common').log
  , config = require('bt-co-common').config
  , redis_connect = require('bt-co-common').redis_connect;

var multer = require('koa-multer');

const router = require('./routes/');

// global middlewares
app.keys = ['doplhin', 'btclass_dolphin'];
app.use(session({
  store: redisStore({
    host:  config.redis.host,
	port: config.redis.port,
	db: config.redis.webSessionDB,
	auth_pass: config.redis.pass,
	prefix: 'dolphin:'
  })
}));
app.use(views('views', { root: __dirname + '/views', default: 'html' }));
// app.use(multer({ dest: './uploads/'}));
// app.use(require('koa-bodyparser')());
// app.use(json());
app.use(logger());

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

app.use(mount('/static', require('koa-static')(__dirname + '/public')));

app.use(function* (next) {
    try {
        yield* next;
    } catch(e) {
        let status = e.status || 500;
        let message = e.message || '服务器错误';

        this.body = {
            'status': status,
            'message': message
        };
        return;
    }
});

// mount root routes  
app.use(router.routes(), router.allowedMethods());

app.on('error', function(err, ctx){
  log.error('server error', err, ctx);
});

module.exports = app;
