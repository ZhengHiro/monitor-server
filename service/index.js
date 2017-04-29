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
    } catch (e) {
        console.log(e);
        throw('SERVICE: 获取所有电脑信息失败');
    }

    return result;
};

//设置计算机昵称
exports.setNickName = function* (address, nickname) {
    try {
        var result = yield DAO.setNickName(address, nickname);
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