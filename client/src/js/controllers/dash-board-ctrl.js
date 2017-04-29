/**
 * Master Controller
 */

angular.module('RDash')
    .controller('DashboardCtrl', ['$scope', '$rootScope', '$cookieStore', '$interval', '$http', DashboardCtrl]);

function DashboardCtrl($rootScope, $scope, $cookieStore, $interval, $http) {
    /**
     * Get computer list
     */
    $scope.selectedComputer = -1;
    $scope.isLoadingComputers = true;

    $interval(function() {
        $scope.getComputerList()
    }, 2000);
    $scope.getComputerList = function () {
        $http({
            method: 'GET',
            url: './all-pc',
        }).then(function (response) {
            $scope.isLoadingComputers = false;

            var result = response.data;
            if (result.status == 200) {
                var tempIndex = -1;
                var time = Math.floor(new Date().getTime()/1000);
                for (var i = 0, iL = result.data.length; i < iL; i++) {
                    if (time - result.data[i].lastOnline > 100) {
                        result.data[i].onlineTime = new Date(result.data[i].lastOnline*1000);
                        result.data[i].isOnline = false;
                        result.data[i].sinceNow = Math.floor((time - result.data[i].lastOnline)/60);
                    } else {
                        if ($scope.selectedComputer == -1) {
                            tempIndex = i;
                        }
                        result.data[i].isOnline = true;
                        if (result.data[i].remoteTime > 0) {
                            result.data[i].isLocal = false;
                            result.data[i].sinceNow = Math.floor(result.data[i].remoteTime/60);
                        } else {
                            result.data[i].isLocal = true;
                            result.data[i].sinceNow = Math.floor(result.data[i].localTime/60);
                        }
                    }
                }
                $scope.computers = result.data;
                if (tempIndex != -1) {
                    $scope.selectComputer(tempIndex);
                }
            } else {
                console.log(response);
            }
        }, function (response) {
            $scope.isLoadingComputers = false;

            console.log(response);
        });
    };

    var T;

    $scope.selectComputer = function(index) {
        if ($scope.computers[index].isOnline == false || $scope.selectedComputer == index) {
            return ;
        }
        $scope.isLoadingSystem = true;
        clearInterval(T);
        T = setInterval(function() {
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
                var series = [];

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
    }
}