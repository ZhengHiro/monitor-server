var db = require('../custom-module/mongodb-module.js');
var wrap = require('co-monk');
var colInfo = wrap(db.get('monitor_info'));
var colTime = wrap(db.get('monitor_time_info'));
var colSwitch = wrap(db.get('monitor_switch_info'));
var colProcess = wrap(db.get('monitor_process_info'));
var colScreen = wrap(db.get('monitor_screen_info'));
var colSystem = wrap(db.get('monitor_system_info'));


//获取电脑信息
exports.getPCInfo = function* (address) {
    try {
        var rows = yield colInfo.find({
            address: address
        });
    } catch (e) {
        console.log(e);
        throw('DAO: 获取电脑信息失败');
    }

    return rows && rows[0];
};

//新建电脑信息
exports.addPCInfo = function* (address) {
    try {
        //判断是否存在
        var info = yield this.getPCInfo(address);
        if (!info) {
            //获取电脑数量
            var number = yield colInfo.count({});
            yield colInfo.insert({
                address: address,
                nickname: '',
                index: number+1
            });
        } else {
            return info.index;
        }
    } catch (e) {
        console.log(e);
        throw('DAO:新建电脑信息失败');
    }

    return (number+1);
};

//心跳
exports.getHeart = function* (address, time) {
    try {
        //获取当前时间的日期的时间戳
        var date = new Date(time * 1000);
        date.setHours(0);
        date.setSeconds(0);
        date.setMinutes(0);
        var dateTime = parseInt(date.getTime()/1000);

        //查找记录
        var rows = yield colTime.find({
            address: address,
            dateTime: dateTime
        });

        //有则更新，无则插入
        if (!rows || rows.length == 0) {
            yield colTime.insert({
                address: address,
                dateTime: dateTime,
                screenShots: [],
                processes: [],
                totalTime: 2,
                closeTime: [],
                openTime: [],
                system: []
            });
        } else {
            yield colTime.update({
                address: address,
                dateTime: dateTime
            }, {
                $inc: {
                    totalTime: 2
                }
            });
        }
    } catch (e) {
        console.log(e);
        throw('DAO: 处理心跳失败');
    }

    return 'success';
};

//设置开关机时间
exports.setSwitchInfo = function* (address, time, openTime, closeTime) {
    try {
        //查找记录
        var rows = yield colSwitch.find({
            address: address,
            time: openTime
        });

        //有则跳过，无则插入
        if (!rows || rows.length == 0) {
            yield colSwitch.insert({
                address: address,
                time: openTime,
                type: 'open'
            });
        }

        rows = yield colSwitch.find({
            address: address,
            time: closeTime
        });

        //有则跳过，无则插入
        if (!rows || rows.length == 0) {
            yield colSwitch.insert({
                address: address,
                time: closeTime,
                type: 'close'
            });
        }
    } catch (e) {
        console.log(e);
        throw('DAO: 设置开关机失败');
    }

    return 'success';
};

//设置进程信息
exports.setProcesses = function* (address, time, processes) {
    try {
        //查找记录
        var rows = yield colProcess.find({
            address: address,
            time: time
        });

        //有则跳过，无则插入
        if (!rows || rows.length == 0) {
            yield colProcess.insert({
                address: address,
                time: time,
                processes: processes
            });
        }
    } catch (e) {
        console.log(e);
        throw('DAO: 设置进程信息失败');
    }

    return 'success';
};

//添加截图
exports.addScreenShot = function* (address, time, targetName) {
    try {
        //查找记录
        var rows = yield colScreen.find({
            address: address,
            time: time
        });

        //有则跳过，无则插入
        if (!rows || rows.length == 0) {
            yield colScreen.insert({
                address: address,
                time: time,
                targetName: targetName
            });
        }
    } catch (e) {
        console.log(e);
        throw('DAO: 添加截图失败');
    }

    return 'success';
};

//设置系统信息
exports.setSystemInfo = function* (address, time, memory, cpuUsed, cpuFree) {
    try {
        //查找记录
        var rows = yield colSystem.find({
            address: address,
            time: time
        });

        //有则跳过，无则插入
        if (!rows || rows.length == 0) {
            yield colSystem.insert({
                address: address,
                time: time,
                memory: memory,
                cpuUsed: cpuUsed,
                cpuFree: cpuFree
            });
        }
    } catch (e) {
        console.log(e);
        throw('DAO: 设置系统信息失败');
    }

    return 'success';
};

//获取电脑信息
exports.getAllPCInfo = function* () {
    try {
        var rows = yield colInfo.find({});
    } catch (e) {
        console.log(e);
        throw('DAO: 获取所有电脑信息失败');
    }

    return rows;
};

//获取一段时间的系统信息
exports.getSystemInfo = function* (address, startTime, endTime) {
    try {
        var rows = yield colSystem.find({
            address: address,
            time: {
                $lte : endTime,
                $gte : startTime
            }
        });
    } catch (e) {
        console.log(e);
        throw('DAO: 获取系统信息失败');
    }

    return rows;
};

//获取一段时间的屏幕截图
exports.getScreenShot = function* (address, startTime, endTime) {
    try {
        var rows = yield colScreen.find({
            address: address,
            time: {
                $lte : endTime,
                $gte : startTime
            }
        });
    } catch (e) {
        console.log(e);
        throw('DAO: 获取屏幕截图失败');
    }

    return rows;
};

//获取一段时间的进程信息
exports.getProcessInfo = function* (address, startTime, endTime) {
    try {
        var rows = yield colProcess.find({
            address: address,
            time: {
                $lte : endTime,
                $gte : startTime
            }
        });
    } catch (e) {
        console.log(e);
        throw('DAO: 获取进程信息失败');
    }

    return rows;
};

//获取一段时间内的在线时间
exports.getOnlineTime = function* (address, startTime, endTime) {
    try {
        var rows = yield colTime.find({
            address: address,
            dateTime: {
                $lte : endTime,
                $gte : startTime
            }
        });
    } catch (e) {
        console.log(e);
        throw('DAO: 获取一段时间内的在线时间失败');
    }

    return rows;
};

//设置计算机昵称
exports.setNickName = function* (address, nickname) {
    console.log(address, nickname);
    try {
        var rows = yield colInfo.update({
            address: address
        }, {
            $set: {
                nickname: nickname
            }
        });
    } catch (e) {
        console.log(e);
        throw('DAO: 获取一段时间内的在线时间失败');
    }

    return rows;
};