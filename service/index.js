const DAO = require('../dao/index.js');

//获取电脑信息
exports.getPCInfo = function* (address) {
    try {
        var result = yield DAO.getPCInfo(address);
        if (!result) {
            yield DAO.addPCInfo(address);
            result = yield DAO.getPCInfo(address);
        }
    } catch (e) {
        console.log(e);
        throw('SERVICE: 获取电脑信息失败');
    }

    return result;
};

//心跳
exports.setHeart = function* (address, time, remoteable) {
    try {
        var result = yield DAO.setHeart(address, time, remoteable);
    } catch (e) {
        console.log(e);
        throw('SERVICE: 处理心跳失败');
    }

    return result;
};

//设置开关机时间
exports.setSwitchInfo = function* (address, time, openTime, closeTime) {
    try {
        var result = yield DAO.setSwitchInfo(address, time, openTime, closeTime);
    } catch (e) {
        console.log(e);
        throw('SERVICE: 设置开关机时间失败');
    }

    return result;
};

//设置进程信息
exports.setProcesses = function* (address, time, processes) {
    try {
        var result = yield DAO.setProcesses(address, time, processes);
    } catch (e) {
        console.log(e);
        throw('SERVICE: 设置进程信息');
    }

    return result;
};

//添加截图
exports.addScreenShot = function* (address, time, targetName) {
    try {
        var result = yield DAO.addScreenShot(address, time, targetName);
    } catch (e) {
        console.log(e);
        throw('SERVICE: 添加截图失败');
    }

    return result;
};

//设置系统信息
exports.setSystemInfo = function* (address, time, memory, cpuUsed) {
    try {
        var result = yield DAO.setSystemInfo(address, time, memory, cpuUsed);
    } catch (e) {
        console.log(e);
        throw('SERVICE: 设置系统信息失败');
    }

    return result;
};


//获取一段时间内的监控信息
exports.getMonitorInfo = function* (address, startTime, endTime) {
    try {
        var [onlineInfo, systemInfo, screenInfo, processInfo] = yield [
            DAO.getOnlineInfo(address,startTime, endTime),
            DAO.getSystemInfo(address, startTime, endTime),
            DAO.getScreenShot(address, startTime, endTime),
            DAO.getProcessInfo(address, startTime, endTime)
        ];

    } catch (e) {
        console.log(e);
        throw('SERVICE: 获取监控信息失败');
    }

    return {
        address: address,
        onlineInfo: onlineInfo,
        systemInfo: systemInfo,
        screenInfo: screenInfo,
        processInfo: processInfo
    };
};

//获取在线时间
exports.getOnlineTime = function* (address, startTime, endTime) {
    try {
        var result = yield DAO.getOnlineTime(address, startTime, endTime);
    } catch (e) {
        console.log(e);
        throw('SERVICE: 获取在线时间失败');
    }

    return result;
};

//获取所有电脑信息
exports.getAllPCInfo = function* () {
    try {
        var result = yield DAO.getAllPCInfo();
        for (var i = 0, iL = result.length; i < iL; i++) {
            var isWorking = yield DAO.checkWorking(result[i].address);
            result[i].isWorking = isWorking;
        }
    } catch (e) {
        console.log(e);
        throw('SERVICE: 获取所有电脑信息失败');
    }

    return result;
};

//设置计算机信息
exports.setPCInfo = function* (address, nickname, group) {
    try {
        var result = yield DAO.setPCInfo(address, nickname, group);
    } catch (e) {
        console.log(e);
        throw('SERVICE: 设置计算机昵称失败');
    }

    return result;
};

//获取内存占用率
exports.getProcessRate = function* (address, dateTime) {
    try {
        var result = yield DAO.getProcessRate(address, dateTime);
    } catch (e) {
        console.log(e);
        throw('SERVICE: 获取内存占用率失败');
    }

    return result;
};


//统计数据
exports.getStatisticsInfo = function* (address, type) {
    var endTime = Math.floor(new Date().getTime() / 1000), startTime;
    var endDate = new Date();
    endDate.setHours(0);
    endDate.setMinutes(0);
    endDate.setSeconds(0);
    endDateTime = Math.floor(endDate.getTime()/1000);
    if (type == 'day') {
        startTime = endDateTime - 24*60*60;
    } else if (type == 'week') {
        startTime = endDateTime - 7*24*60*60;
    } else if (type == 'month') {
        startTime = endDateTime - 30*24*60*60;
    }
    try {
        var [onlineTime, processRate] = yield [
            DAO.getOnlineTime(address,startTime, endTime),
            DAO.getProcessRateByTime(address, startTime, endTime)
        ];

        var totalTime = 0, remoteTime = 0, localTime = 0, workingTime = 0, studyTime, gameTime;
        for (let i = 0, iL = onlineTime.length; i < iL; i++) {
            totalTime += onlineTime[i].totalTime;
            remoteTime += onlineTime[i].remoteTime;
            localTime += onlineTime[i].localTime;
            workingTime += onlineTime[i].workingTime;
            studyTime += onlineTime[i].studyTime;
            gameTime += onlineTime[i].gameTime;
        }

        var rates = {};
        for (let i = 0, iL = processRate.length; i < iL; i++) {
            if (!rates[processRate[i].processName]) {
                rates[processRate[i].processName] = 0
                rates[processRate[i].processName] += processRate[i].totalMem;
            } else {
                rates[processRate[i].processName] += processRate[i].totalMem;
            }
        }
        processRate = [];
        for (var key in rates) {
            processRate.push({
                processName: key,
                totalMem: rates[key]
            });
        }
    } catch (e) {
        console.log(e);
        throw('SERVICE: 获取监控信息失败');
    }

    return {
        address: address,
        totalTime: totalTime,
        remoteTime: remoteTime,
        localTime: localTime,
        workingTime: workingTime,
        gameTime: gameTime,
        studyTime: studyTime,
        processRate: processRate
    };
};

//获取小组统计数据
exports.getStatisticsInfoByGroup = function* (group, type) {
    var endTime = Math.floor(new Date().getTime() / 1000), startTime;
    var endDate = new Date();
    endDate.setHours(0);
    endDate.setMinutes(0);
    endDate.setSeconds(0);
    endDateTime = Math.floor(endDate.getTime()/1000);
    if (type == 'day') {
        startTime = endDateTime - 24*60*60;
    } else if (type == 'week') {
        startTime = endDateTime - 7*24*60*60;
    } else if (type == 'month') {
        startTime = endDateTime - 30*24*60*60;
    }
    try {
        var computers = yield DAO.getPCByGroups(group);
        var result = [];
        for (var i = 0, iL = computers.length; i < iL; i++) {
            var onlineTime = yield DAO.getOnlineTime(computers[i].address,startTime, endTime);

            var totalTime = 0, remoteTime = 0, localTime = 0, workingTime = 0;
            for (let j = 0, jL = onlineTime.length; j < jL; j++) {
                totalTime += onlineTime[j].totalTime;
                remoteTime += onlineTime[j].remoteTime;
                localTime += onlineTime[j].localTime;
                workingTime += onlineTime[j].workingTime;
            }

            result.push({
                address: computers[i].address,
                nickname: computers[i].nickname,
                totalTime: totalTime,
                remoteTime: remoteTime,
                localTime: localTime,
                workingTime: workingTime,
            });
        }

    } catch (e) {
        console.log(e);
        throw('SERVICE: 获取监控信息失败');
    }

    return result;
};