var router = require('koa-router')();
var body = require('koa-better-body');
var fs = require('fs');
var cfs = require('co-fs');

var service = require('../service/index.js');


//心跳
router.post('/heart', body(), function* (next) {
	var data = this.request.fields;
	var address = data.address;
	var time = data.nowTime;
	var remoteable = data.remoteable;

	try {
        yield service.setHeart(address, time, remoteable);
    } catch (e) {
		console.log(e);
		this.body = 'failure';
		return ;
	}

	this.body = 'success';
});

//设置开关机时间
router.post('/switch-info', body(), function* (next) {
	var data = this.request.fields;
	var address = data.address;
	var time = data.nowTime;
	var openTime = data.openTime;
	var closeTime = data.closeTime;

	try {
		yield service.setSwitchInfo(address, time, openTime, closeTime);
	} catch (e) {
		console.log(e);
		this.body = 'failure';
		return ;
	}

	this.body = 'success';
});

//获取进程信息
router.post('/process-info', body(), function* (next) {
	var data = this.request.fields;
	var address = data.address;
	var time = data.nowTime;
	var processes = data.processes;

	processes.forEach(function(value) {
	    value.mem = parseInt(value.mem);
    });

    try {
        yield service.setProcesses(address, time, processes);
    } catch (e) {
        console.log(e);
        this.body = 'failure';
        return ;
    }

	this.body = 'success';
});

//获取屏幕截图
router.post('/screen-shot', body(), function* (next) {
	var files = this.request.files;
	var fields = this.request.fields;
	var address = fields.address;

	var PCInfo = yield service.getPCInfo(address);

    try {
        fs.accessSync('./client/dist/uploads', fs.constants.F_OK)
    } catch(e) {
        yield cfs.mkdir('./client/dist/uploads');
    }
	try {
		fs.accessSync('./client/dist/uploads/screen-' + PCInfo.index, fs.constants.F_OK)
    } catch(e) {
		yield cfs.mkdir('./client/dist/uploads/screen-' + PCInfo.index);
	}


    try {
		for (let i = 0, iL = files.length; i < iL; i++) {
            let targetName = './client/dist/uploads/screen-' + PCInfo.index + '/' + files[i].name;
            let path = './uploads/screen-' + PCInfo.index + '/' + files[i].name;
            let time = files[i].name.match(/[0-9]{10}/)[0];
            let sourceName = files[i].path;

            yield cfs.rename(sourceName, targetName);

            yield service.addScreenShot(address, parseInt(time), path);
        }
	} catch (e) {
		console.log(e);
		this.body = 'failure';
		return ;
	}

	this.body = 'success';
});

//获取系统信息
router.post('/system-info', body(), function* (next) {
    var fields = this.request.fields;
    var address = fields.address;
    var time = fields.nowTime;
    var memory = fields.memory;
    var cpuUsed = fields.cpuUsed;

    try {
        yield service.setSystemInfo(address, time, memory, cpuUsed);
    } catch (e) {
        console.log(e);
        this.body = 'failure';
        return ;
    }

    this.body = 'success';
});

//渲染主页
router.get('/', function *(next) {
    yield this.render('index');
});

//渲染主页
router.get('/index', function *(next) {
    yield this.render('index');
});

//渲染历史记录
router.get('/history', function *(next) {
    yield this.render('history');
});


//获取某一天的进程占用率
router.get('/process-rate', body(), function* (next) {
    var dateTime = parseInt(this.query.dateTime);
    var date = new Date(dateTime*1000);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    dateTime = Math.floor(date.getTime()/1000);
    var address = this.query.address;

    try {
        var result = yield service.getProcessRate(address, dateTime);
    } catch (e) {
        console.log(e);
        throw('获取进程占用率失败')
    }

    this.body = {
        status: 200,
        data: result,
        message: 'success'
    };
});

//获取一段时间内的所有监控信息
router.get('/monitor-info', body(), function* (next) {
    var startTime = parseInt(this.query.startTime) || 0;
    var endTime = parseInt(this.query.endTime);
    var address = this.query.address;

    if (!endTime) {
    	endTime = Math.floor(new Date().getTime() / 1000);
	}

    try {
        var result = yield service.getMonitorInfo(address, startTime, endTime);
    } catch (e) {
        console.log(e);
        throw('获取监控信息失败')
    }

    this.body = {
    	status: 200,
		data: result,
		message: 'success'
	};
});

//获取一段时间内的在线时间
router.get('/online-time', body(), function* (next) {
    var address = this.query.address;
    var startTime = parseInt(this.query.startTime);
    var endTime = parseInt(this.query.endTime);
    console.log(address);
    console.log(startTime);
    console.log(endTime);

    try {
        var result = yield service.getOnlineTime(address, startTime, endTime);
    } catch (e) {
        console.log(e);
        throw('获取在线时间失败')
    }

    this.body = {
        status: 200,
        data: result,
        message: 'success'
    };
});

//获取所有计算机
router.get('/all-pc', body(), function* (next) {
	try {
		var result = yield service.getAllPCInfo();
	} catch (e) {
		console.log(e);
		throw('获取所有计算机信息失败');
	}

	this.body = {
		status: 200,
		data: result,
		message: 'success'
	};
});

//设置计算机信息
router.post('/pc-info', body(), function* (next) {
    var fields = this.request.fields;
    var address = fields.address;
    var nickname = fields.nickname;
    var group = fields.group;

    try {
        var result = yield service.setPCInfo(address, nickname, group);
    } catch (e) {
        console.log(e);
        throw('设置计算机昵称失败');
    }

    this.body = {
        status: 200,
        data: result,
        message: 'success'
    };
});


/**
 * 数据统计
 */
//获取统计数据
router.get('/statistics-info', body(), function* (next) {
    var address = this.query.address;
    var type = this.query.type; // 'day' || 'week' || 'month'

    try {
        var result = yield service.getStatisticsInfo(address, type);
    } catch (e) {
        console.error(e);
        this.throw(500, '获取统计数据失败');
    }

    this.body = {
        status: 200,
        data: result,
        message: 'success'
    };
});

//根据小组获取统计数据
router.get('/group/statistics-info', body(), function* (next) {
    var group = this.query.group;
    var type = this.query.type; // 'day' || 'week' || 'month'

    try {
        var result = yield service.getStatisticsInfoByGroup(group, type);
    } catch (e) {
        console.error(e);
        this.throw(500, '获取统计数据失败');
    }

    this.body = {
        status: 200,
        data: result,
        message: 'success'
    };
});

module.exports = router;
