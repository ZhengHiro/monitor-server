/**
 * Master Controller
 */

angular.module('RDash')
    .controller('DashboardCtrl', ['$scope', '$rootScope', '$timeout', '$interval', '$http', DashboardCtrl]);

function DashboardCtrl($rootScope, $scope, $timeout, $interval, $http) {
    var DANGER_REMOTE_TIME = 60*60*24; // 一天
    var DANGER_ONLINE_TIME = 60*60*72; // 三天
    var DANGER_OFFLINE_TIME = 60*60*72; // 三天


    /**
     * Get computer list
     */
    $scope.selectedComputer = -1;
    $scope.isLoadingComputers = true;

    $interval.cancel($scope.dashFreshComputerT);

    $scope.dashFreshComputerT = $interval(function() {
        $scope.getComputerList();
    }, 2000);
    $scope.getComputerList = function () {
        $http({
            method: 'GET',
            url: './all-pc',
        }).then(function (response) {
            $scope.alerts = [];
            $scope.isLoadingComputers = false;

            var result = response.data;
            if (result.status == 200) {
                var tempIndex = -1;
                var time = Math.floor(new Date().getTime()/1000);
                for (var i = 0, iL = result.data.length; i < iL; i++) {
                    if (time - result.data[i].lastOnline > 100) {
                        result.data[i].onlineTime = new Date(result.data[i].lastOnline*1000);
                        result.data[i].isOnline = false;
                        result.data[i].sinceNow = ((time - result.data[i].lastOnline)/60/60).toFixed(2);

                        if (time - result.data[i].lastOnline >= DANGER_OFFLINE_TIME) {
                            $scope.alerts.push({
                                type: 'danger',
                                msg: (result.data[i].nickname || result.data[i].address) + '已经超过三天没在线，监控程序可能没有正常启动'
                            });
                        }
                    } else {
                        if ($scope.selectedComputer == -1) {
                            tempIndex = i;
                        }
                        result.data[i].isOnline = true;
                        if (result.data[i].remoteTime > 0) {
                            result.data[i].isLocal = false;
                            result.data[i].sinceNow = (result.data[i].remoteTime/60/60).toFixed(2);

                            if (result.data[i].remoteTime >= DANGER_REMOTE_TIME) {
                                $scope.alerts.push({
                                    type: 'danger',
                                    msg: (result.data[i].nickname || result.data[i].address) + '超过一天处于远程登录状态，请检查是否本人正常使用'
                                });
                            }
                        } else {
                            result.data[i].isLocal = true;
                            result.data[i].sinceNow = (result.data[i].localTime/60/60).toFixed(2);
                        }


                        if (Math.max(result.data[i].localTime, result.data[i].remoteTime) >= DANGER_ONLINE_TIME) {
                            $scope.alerts.push({
                                type: 'danger',
                                msg: (result.data[i].nickname || result.data[i].address) + '连续在线超过三天，请检查计算机是否正常使用'
                            });
                        }
                    }
                }
                $scope.computers = result.data;
                if (tempIndex != -1) {
                    $scope.selectComputer(tempIndex);
                }
                if ($scope.selectedComputer == -1) {
                    $scope.alerts.push({
                        type: 'warning',
                        msg: '当前没有计算机在线'
                    });
                }
            } else {
                console.log(response);
            }
        }, function (response) {
            $scope.isLoadingComputers = false;

            console.log(response);
        });
    };

    $scope.selectComputer = function(index) {
        if ($scope.computers[index].isOnline == false || $scope.selectedComputer == index) {
            return ;
        }
        $scope.isLoadingSystem = true;
        $interval.cancel($scope.dashGetMonitorT);
        $scope.dashGetMonitorT = $interval(function() {
            var startTime = Math.floor(new Date().getTime()/1000) - 5 * 60;
            var endTime = Math.floor(new Date().getTime()/1000);
            $scope.getComputerMonitor($scope.computers[index].address, startTime, endTime);
        }, 2000);
        $scope.selectedComputer = index;
    };

    /**
     * Get computer monitor
     */
    $scope.getComputerMonitor = function (address, startTime, endTime) {
        $http({
            method: 'GET',
            url: './monitor-info',
            params: {
                address: address,
                startTime: startTime,
                endTime: endTime
            }
        }).then(function (response) {
            $scope.isLoadingSystem = false;

            var result = response.data;

            if (result.status == 200) {
                var data = result.data;
                var memory = [];
                var date;

                data.systemInfo.sort(function(a, b) {
                    return a.time - b.time;
                });

                $scope.monitorInfos = data;
                $scope.targetImage = data.screenInfo[data.screenInfo.length-1].targetName;
                $scope.processes = data.processInfo[data.processInfo.length-1].process;
                $scope.delProcesses = data.processInfo[data.processInfo.length-1].addProcess;
                $scope.addProcesses = data.processInfo[data.processInfo.length-1].delProcess;

                data.systemInfo.forEach(function(row) {
                    date = new Date(row.time * 1000);
                    memory.push({
                        name: date.toString(),
                        value: [
                            [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('/') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':'),
                            row.memory,
                        ]
                    });
                });
                series.push({
                    name: '内存占用',
                    type: 'line',
                    showSymbol: false,
                    hoverAnimation: false,
                    connectNulls: true,
                    data: memory
                });

                var cpu = [];
                data.systemInfo.forEach(function(row) {
                    date = new Date(row.time * 1000);
                    if(row.cpuUsed > 100) {
                        row.cpuUsed = 100;
                    }
                    cpu.push({
                        name: date.toString(),
                        value: [
                            [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('/') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':'),
                            row.cpuUsed,
                        ]
                    });
                });
                series.push({
                    name: 'cpu占用',
                    type: 'line',
                    showSymbol: false,
                    hoverAnimation: false,
                    connectNulls: true,
                    data: cpu
                });

                $scope.realTimeSystem = series;

            } else {
                console.log(response);
            }
        }, function (response) {
            console.log(response);
        });
    };

    $scope.setPoint = function(time) {
        if ($scope.selectPointTime == time) {
            return;
        }
        $scope.selectPointTime = time;
        var data = $scope.monitorInfos;

        for (var i = 0, iL = data.screenInfo.length; i < iL; i++) {
            if(data.screenInfo[i].time == time) {
                $scope.targetImage = data.screenInfo[i].targetName;
                break;
            }
        }
        for (var i = 0, iL = data.processInfo.length; i < iL; i++) {
            if(data.processInfo[i].time == time) {
                $scope.processes = data.processInfo[i].process;
                $scope.delProcesses = data.processInfo[i].addProcess;
                $scope.addProcesses = data.processInfo[i].delProcess;
                break;
            }
        }
        $scope.$apply();
    };


    $scope.alerts = [];

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
}