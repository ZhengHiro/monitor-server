/**
 * Statistics Controller
 */

angular.module('RDash')
    .controller('StatisticsCtrl', ['$scope', '$http', '$interval', '$timeout', StatisticsCtrl]);

function StatisticsCtrl($scope, $http, $interval, $timeout) {
    $interval.cancel($scope.dashFreshComputerT);
    $interval.cancel($scope.dashGetMonitorT);


    $scope.userType = 'user';
    $scope.searchType = 'day';

    $scope.setUserType = function(type) {
        $scope.userType = type;
    };
    $scope.setSearchType = function(type) {
        $scope.searchType = type;
        $scope.getStatisticsInfo();
    };

    /**
     * Get computer list
     */
    $scope.selectedComputer = -1;
    $scope.selectGroup = -1;
    $scope.isLoadingComputers = true;
    $scope.isLoadingData = true;

    $scope.getComputerList = function () {
        $http({
            method: 'GET',
            url: './all-pc',
        }).then(function (response) {
            $scope.isLoadingComputers = false;

            var result = response.data;
            if (result.status == 200) {
                $scope.groups = [];
                $scope.computers = result.data;
                $scope.selectComputer(0);

                var groups = {};
                for (var i = 0, iL = result.data.length; i < iL; i++) {
                    if(!groups[result.data[i].group]) {
                        groups[result.data[i].group] = [];
                    }
                    groups[result.data[i].group].push(result.data[i]);
                }
                for (var key in groups) {
                    $scope.groups.push({
                        name: key,
                        computers: groups[key]
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

    $scope.getComputerList();

    $scope.selectComputer = function(index) {
        $scope.selectedComputer = index;
        $scope.selectedAddress = $scope.computers[index].address;

        $scope.getStatisticsInfo();
    };



    var processRateChart, processRateOption, localTimeChart, localTimeOption, workingTimeChart, workingTimeOption;
    $timeout(function() {
        processRateChart = echarts.init(document.getElementById('process-rate-chart'));
        localTimeChart = echarts.init(document.getElementById('local-time-chart'));
        workingTimeChart = echarts.init(document.getElementById('working-time-chart'));

        processRateOption = {
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {d}%"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: []
            },
            series: [
                {
                    name: '内存占用率',
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '50%'],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    data: []
                }
            ]
        };

        localTimeOption = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c}秒 ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: ['本地登录','远程登录']
            },
            series: [
                {
                    name: '在线方式',
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '50%'],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    data: []
                }
            ]
        };

        workingTimeOption = {
            title : {
                text: '系统分析工作时间',
                subtext: '仅供参考',
                x: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c}秒 ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: ['工作时间','挂机时间']
            },
            series: [
                {
                    name: '工作状态',
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '50%'],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    data: []
                }
            ]
        }
    });


    $scope.getStatisticsInfo = function() {
        $scope.isLoadingData = true;

        $http({
            method: 'GET',
            url: './statistics-info',
            params: {
                address: $scope.selectedAddress,
                type: $scope.searchType
            }
        }).then(function (response) {
            $scope.isLoadingData = false;

            var result = response.data;
            if (result.status == 200) {
                var data = result.data;

                //进程占用率
                var processRate = data.processRate;
                processRateOption.series[0].data = [];
                processRate.sort(function(a, b) {
                    return b.totalMem - a.totalMem;
                });
                var tag = false, otherProcess = 0;
                for (var i = 0, iL = processRate.length; i < iL; i++) {
                    if (i < 15) {
                        processRateOption.legend.data.push(processRate[i].processName);
                        processRateOption.series[0].data.push({
                            value: processRate[i].totalMem,
                            name: processRate[i].processName
                        });
                    } else if (!tag) {
                        tag = true;
                        otherProcess += processRate[i].totalMem;
                        processRateOption.legend.data.push('其他');
                    } else {
                        otherProcess += processRate[i].totalMem;
                    }
                }
                if (otherProcess) {
                    processRateOption.series[0].data.push({
                        value: otherProcess,
                        name: '其他'
                    });
                }
                processRateChart.setOption(processRateOption);

                //在线时间
                localTimeOption.series[0].data = [
                    { value: data.localTime, name:'本地登录'},
                    { value: data.remoteTime, name:'远程登录'},
                ];
                localTimeChart.setOption(localTimeOption);

                workingTimeOption.series[0].data = [
                    { value: data.workingTime, name:'工作时间'},
                    { value: data.totalTime - data.workingTime, name:'挂机时间'},
                ];
                workingTimeChart.setOption(workingTimeOption);

            } else {
                console.log(response);
            }
        }, function (response) {
            console.log(response);
        });
    }
}