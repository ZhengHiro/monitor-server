var db = require('../config/mongoose');
var co = require('co');

var ComputerInfo = db.model('computer_info');
var ProcessInfo = db.model('process_info');
var ScreenInfo = db.model('screen_info');
var SwitchInfo = db.model('switch_info');
var SystemInfo = db.model('system_info');
var TimeInfo = db.model('time_info');
var OnlineInfo = db.model('online_info');
var ProcessRate = db.model('process_rate');

const HAS_PROCESS = 1;
const HAS_SYSTEM = 2;
const HAS_SCREEN = 4;


//获取电脑信息
exports.getPCInfo = function* (address) {
    try {
        var rows = yield ComputerInfo.find({
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
            var number = yield ComputerInfo.count({});
            var computer = new ComputerInfo({
                address: address,
                nickname: '',
                index: number+1,
                lastOnline: 0,
                remoteTime: 0,
                localTime: 0,
                group: number+1
            });
            yield computer.save();
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
exports.setHeart = function* (address, time, remoteable) {
    try {
        //获取当前时间的日期的时间戳
        var date = new Date(time * 1000);
        date.setHours(0);
        date.setSeconds(0);
        date.setMinutes(0);
        var dateTime = parseInt(date.getTime()/1000);

        var computerInfo = yield ComputerInfo.find({ address: address });
        var lastOnline = computerInfo[0].lastOnline;
        if (new Date().getTime() / 1000 - lastOnline > 100) {
            yield ComputerInfo.update({
                address: address
            }, {
                $set: {
                    lastOnline: time,
                    localTime: 0
                },
                $inc: {
                    remoteTime: 0
                }
            });
        } else if (remoteable) {
            yield ComputerInfo.update({
                address: address
            }, {
                $set: {
                    lastOnline: time,
                    localTime: 0
                },
                $inc: {
                    remoteTime: 5
                }
            });
        } else {
            yield ComputerInfo.update({
                address: address
            }, {
                $set: {
                    lastOnline: time,
                    remoteTime: 0
                },
                $inc: {
                    localTime: 5
                }
            });
        }

        //查找记录
        var rows = yield TimeInfo.find({
            address: address,
            dateTime: dateTime
        });

        //有则更新，无则插入
        if (!rows || rows.length == 0) {
            var timeInfo;
            if (remoteable) {
                timeInfo = new TimeInfo({
                    address: address,
                    dateTime: dateTime,
                    totalTime: 5,
                    remoteTime: 5,
                    localTime: 0
                });
            } else {
                timeInfo = new TimeInfo({
                    address: address,
                    dateTime: dateTime,
                    totalTime: 5,
                    remoteTime: 0,
                    localTime: 5
                });
            }

            timeInfo.save();
        } else {
            if (remoteable) {
                yield TimeInfo.update({
                    address: address,
                    dateTime: dateTime
                }, {
                    $inc: {
                        totalTime: 5,
                        remoteTime: 5
                    }
                });
            } else {
                yield TimeInfo.update({
                    address: address,
                    dateTime: dateTime
                }, {
                    $inc: {
                        totalTime: 5,
                        localTime: 5
                    }
                });
            }
        }

        rows = yield OnlineInfo.find({
            address: address,
            time: time
        });

        //无则插入
        if (!rows || rows.length == 0) {
            var onlineInfo;
            onlineInfo = new OnlineInfo({
                address: address,
                time: time,
                remoteable: remoteable,
                status: 0
            });

            onlineInfo.save();
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
        var switchInfo;

        //查找记录
        var rows = yield SwitchInfo.find({
            address: address,
            time: openTime
        });

        //有则跳过，无则插入
        if (!rows || rows.length == 0) {
            switchInfo = new SwitchInfo({
                address: address,
                time: openTime,
                type: 'open'
            });
            yield switchInfo.save();
        }

        rows = yield SwitchInfo.find({
            address: address,
            time: closeTime
        });

        //有则跳过，无则插入
        if (!rows || rows.length == 0) {
            switchInfo = new SwitchInfo({
                address: address,
                time: closeTime,
                type: 'close'
            });
            yield switchInfo.save();
        }
    } catch (e) {
        console.log(e);
        throw('DAO: 设置开关机失败');
    }

    return 'success';
};

//设置进程信息
exports.setProcesses = function* (address, time, processes, loopTime = 0) {
    var that = this;
    try {
        var rows = yield OnlineInfo.find({
            address: address,
            time: {$lte: time + 5, $gte: time - 5}
        }).sort({
            time: -1
        });
        if (!rows) {
            return ;
        }
        var tag = false;
        for (let i = 0, iL = rows.length; i < iL; i++) {
            var onlineinfo = rows[i];

            if (onlineinfo && !(onlineinfo.status & HAS_PROCESS)) {
                //最高率分析
                //获取当前时间的日期的时间戳
                var date = new Date(time * 1000);
                date.setHours(0);
                date.setSeconds(0);
                date.setMinutes(0);
                var dateTime = parseInt(date.getTime()/1000);

                for (let j = 0, jL = processes.length; j < jL; j++) {
                    var processRateRow = yield ProcessRate.find({
                        address: address,
                        dateTime: dateTime,
                        processName: processes[j].processName
                    });
                    processRateRow = processRateRow && processRateRow[0];
                    if (!processRateRow) {
                        var processRate = new ProcessRate({
                            address: address,
                            dateTime: dateTime,
                            processName: processes[j].processName,
                            totalMem: parseInt(processes[j].mem)
                        });
                        yield processRate.save();
                    } else {
                        yield ProcessRate.update({
                            _id: processRateRow._id
                        }, {
                            $inc: {
                                totalMem: parseInt(processes[j].mem)
                            }
                        })
                    }
                }

                tag = true;

                //进程分析
                var oldRows = yield ProcessInfo.find({
                    address: address,
                    time: {$gte: onlineinfo.time - 60}
                }).sort({
                    time: -1
                }).limit(1);
                var addProcess = [], delProcess = [], totalProcess = [];
                if (oldRows && oldRows[0]) {
                    var allOldProcess = oldRows[0].addProcess.concat(oldRows[0].process);

                    //找新增
                    for (let j = 0; j < processes.length; j++) {
                        var normalTag = false;
                        for (let k = 0; k < allOldProcess.length; k++) {
                            if (processes[j].processId == allOldProcess[k].processId) {
                                totalProcess.push(processes[j]);
                                allOldProcess.splice(k,1);
                                processes.splice(j,1);
                                normalTag = true;
                                break;
                            }
                        }
                        if (!normalTag) {
                            addProcess.push(processes[j]);
                            processes.splice(j,1);
                        }
                    }
                    delProcess = allOldProcess;
                } else {
                    addProcess = processes;
                    delProcess = [];
                    totalProcess = [];
                }

                var process = new ProcessInfo({
                    address: address,
                    time: onlineinfo.time,
                    addProcess: addProcess,
                    delProcess: delProcess,
                    process: totalProcess
                });
                yield process.save();


                //有进程增减判断成工作状态
                if ((addProcess.length != 0 || delProcess.length != 0) && onlineinfo.isWorking) {
                    yield OnlineInfo.update({
                        address: address,
                        time: onlineinfo.time
                    },{
                        $set: {
                            status: onlineinfo.status + HAS_PROCESS,
                            isWorking: 1
                        }
                    });

                    yield TimeInfo.update({
                        address: address,
                        dateTime: dateTime
                    }, {
                        $inc: {
                            workingTime: 5
                        }
                    });
                } else {
                    yield OnlineInfo.update({
                        address: address,
                        time: onlineinfo.time
                    },{
                        $set: {
                            status: onlineinfo.status + HAS_PROCESS
                        }
                    });
                }

                break;
            }
        }
        if (!tag && loopTime <= 4) {
            setTimeout(function() {
                co(that.setProcesses(address, time, processes, loopTime+1));
            }, 2000);
        }
    } catch(e) {
        console.error(e);
        throw('DAO: 设置进程信息失败');
    }

    return 'success';
};

//添加截图
exports.addScreenShot = function* (address, time, targetName, loopTime = 0) {
    var that = this;
    try {
        var rows = yield OnlineInfo.find({
            address: address,
            time: {$lte: time + 5, $gte: time - 5}
        }).sort({
            time: -1
        });
        if (!rows) {
            return ;
        }
        var tag = false;
        for (let i = 0, iL = rows.length; i < iL; i++) {
            var onlineinfo = rows[i];

            if (onlineinfo && !(onlineinfo.status & HAS_SCREEN)) {
                tag = true;
                var screen = new ScreenInfo({
                    address: address,
                    time: onlineinfo.time,
                    targetName: targetName
                });
                yield screen.save();
                yield OnlineInfo.update({
                    address: address,
                    time: onlineinfo.time
                },{
                    $set: {
                        status: onlineinfo.status + HAS_SCREEN
                    }
                });
                break;
            }
        }
        if (!tag && loopTime <= 4) {
            setTimeout(function() {
                co(that.addScreenShot(address, time, targetName, loopTime+1));
            }, 2000);
        }
    } catch(e) {
        log.error(e);
        throw('DAO: 添加截图失败');
    }

    return 'success';
};

//设置系统信息
exports.setSystemInfo = function* (address, time, memory, cpuUsed, loopTime = 0) {
    var that = this;
    try {
        var rows = yield OnlineInfo.find({
            address: address,
            time: {$lte: time + 5, $gte: time - 5}
        }).sort({
            time: -1
        });
        if (!rows) {
            return ;
        }
        var tag = false;
        for (let i = 0, iL = rows.length; i < iL; i++) {
            var onlineinfo = rows[i];

            if (onlineinfo && !(onlineinfo.status & HAS_SYSTEM)) {
                tag = true;
                var system = new SystemInfo({
                    address: address,
                    time: onlineinfo.time,
                    memory: memory,
                    cpuUsed: cpuUsed
                });
                yield system.save();

                //判断是否在线
                var historyInfo = yield SystemInfo.find({
                    address: address,
                    time: {
                        $lte: onlineinfo.time + 180,
                        $gt: onlineinfo.time
                    }
                });

                var sumMemory = 0, sumCPU = 0, avgMemory = 0, avgCPU = 0;
                for (let j = 0, jL = historyInfo.length; j < jL; j++) {
                    sumMemory += historyInfo[j].memory;
                    sumCPU += historyInfo[j].cpuUsed;
                }
                if (historyInfo.length > 0) {
                    avgMemory = sumMemory / historyInfo.length;
                    avgCPU = sumCPU / historyInfo.length;
                }
                if ((Math.abs(avgCPU - cpuUsed) / avgCPU >= 0.3 || Math.abs(avgMemory - memory) / avgMemory >= 0.3) && !onlineinfo.isWorking) {
                    yield OnlineInfo.update({
                        address: address,
                        time: onlineinfo.time
                    },{
                        $set: {
                            status: onlineinfo.status + HAS_SYSTEM,
                            isWorking: 1
                        }
                    });

                    //获取当前时间的日期的时间戳
                    var date = new Date(time * 1000);
                    date.setHours(0);
                    date.setSeconds(0);
                    date.setMinutes(0);
                    var dateTime = parseInt(date.getTime()/1000);
                    yield TimeInfo.update({
                        address: address,
                        dateTime: dateTime
                    }, {
                        $inc: {
                            workingTime: 5
                        }
                    });
                } else {
                    yield OnlineInfo.update({
                        address: address,
                        time: onlineinfo.time
                    },{
                        $set: {
                            status: onlineinfo.status + HAS_SYSTEM
                        }
                    });
                }


                break;
            }
        }
        if (!tag && loopTime <= 4) {
            setTimeout(function() {
                co(that.setSystemInfo(address, time, memory, cpuUsed, loopTime+1));
            }, 2000);
        }
    } catch(e) {
        log.error(e);
        throw('DAO: 设置系统信息失败');
    }

    return 'success';
};




//获取电脑信息
exports.getAllPCInfo = function* () {
    try {
        var rows = yield ComputerInfo.find({});
    } catch (e) {
        console.log(e);
        throw('DAO: 获取所有电脑信息失败');
    }

    return rows;
};

//获取一段时间的系统信息
exports.getSystemInfo = function* (address, startTime, endTime) {
    try {
        var rows = yield SystemInfo.find({
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

//获取一段时间的在线信息
exports.getOnlineInfo = function* (address, startTime, endTime) {
    try {
        var rows = yield OnlineInfo.find({
            address: address,
            time: {
                $lte : endTime,
                $gte : startTime
            }
        });
    } catch (e) {
        console.log(e);
        throw('DAO: 获取在线信息失败');
    }

    return rows;
};

//获取一段时间的屏幕截图
exports.getScreenShot = function* (address, startTime, endTime) {
    try {
        var rows = yield ScreenInfo.find({
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
        var rows = yield ProcessInfo.find({
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
        var rows = yield TimeInfo.find({
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

//设置计算机信息
exports.setPCInfo = function* (address, nickname, group) {
    try {
        var rows = yield ComputerInfo.update({
            address: address
        }, {
            $set: {
                nickname: nickname,
                group: group
            }
        });
    } catch (e) {
        console.log(e);
        throw('DAO: 设置信息失败');
    }

    return rows;
};

//获取内存占用率
exports.getProcessRate = function* (address, dateTime) {
    try {
        var rows = yield ProcessRate.find({
            address: address,
            dateTime: dateTime
        });
    } catch (e) {
        console.log(e);
        throw('DAO: 获取内存占用率失败');
    }

    return rows;
};

//获取内存占用率
exports.getProcessRateByTime = function* (address, startTime, endTime) {
    try {
        var rows = yield ProcessRate.find({
            address: address,
            dateTime: {
                $lte : endTime,
                $gte : startTime
            }
        });
    } catch (e) {
        console.log(e);
        throw('DAO: 获取内存占用率失败');
    }

    return rows;
};