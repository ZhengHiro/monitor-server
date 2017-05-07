/**
 * Statistics Controller
 */

angular.module('RDash')
    .controller('StatisticsCtrl', ['$scope', '$http', '$interval', '$timeout', StatisticsCtrl]);

function StatisticsCtrl($scope, $http, $interval, $timeout) {
    $interval.cancel($scope.dashFreshComputerT);
    $interval.cancel($scope.dashGetMonitorT);

    $scope.firstInit = true;

    $scope.userType = 'user';
    $scope.searchType = 'day';
    $scope.analysisReport = [];

    $scope.setUserType = function(type) {
        $scope.userType = type;
    };
    $scope.setSearchType = function(type) {
        $scope.searchType = type;
        if ($scope.userType == 'user') {
            $scope.getStatisticsInfo();
        } else if ($scope.userType == 'group') {
            $scope.getGroupStatisticsInfo();
        }
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

                $scope.selectComputer(0);
                $scope.selectGroup(0);
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

    $scope.selectGroup = function(index) {
        $scope.selectedGroup = index;
        $scope.selectedGroupName = $scope.groups[index].name;

        $scope.getGroupStatisticsInfo();
    };



    var processRateChart, processRateOption, localTimeChart, localTimeOption, workingTimeChart, workingTimeOption;
    var groupOnlineChart, groupOnlineChartOption, groupLocalChart, groupLocalChartOption, groupWorkingChart, groupWorkingChartOption;
    $timeout(function() {
        processRateChart = echarts.init(document.getElementById('process-rate-chart'));
        localTimeChart = echarts.init(document.getElementById('local-time-chart'));
        workingTimeChart = echarts.init(document.getElementById('working-time-chart'));

        groupOnlineChart = echarts.init(document.getElementById('group-online-chart'));
        groupLocalChart = echarts.init(document.getElementById('group-local-chart'));
        groupWorkingChart = echarts.init(document.getElementById('group-working-chart'));


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
        };

        groupOnlineChartOption = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c}秒 ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: []
            },
            series: [
                {
                    name: '在线时间',
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

        groupLocalChartOption = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c}秒 ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: []
            },
            series: [
                {
                    name: '本地登录时间',
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

        groupWorkingChartOption = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c}秒 ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: []
            },
            series: [
                {
                    name: '工作时间',
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

        $scope.firstInit = false;
    });


    $scope.getStatisticsInfo = function() {
        $scope.isLoadingData = true;
        $scope.analysisReport = [];

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


                //分析结果
                if (data.gameTime / data.workingTime > 0.3) {
                    $scope.analysisReport.push({
                        type: 'text-danger',
                        content: '游戏时间占电脑工作时间的' + (data.gameTime*100 / data.workingTime).toFixed(2) + '%!使用电脑玩游戏时间较多！'
                    });
                }
                if (data.studyTime / data.workingTime > 0.5) {
                    $scope.analysisReport.push({
                        type: 'text-primary',
                        content: '学习时间占电脑工作时间的' + (data.studyTime*100 / data.workingTime).toFixed(2) + '%!比较认真学习！'
                    });
                }
                if (!data.gameTime && data.gameTime > 0.8*data.studyTime) {
                    $scope.analysisReport.push({
                        type: 'text-danger',
                        content: '游戏时间占比较高!使用电脑玩游戏较多！'
                    });
                }
                if (data.workingTime / data.totalTime < 0.7) {
                    $scope.analysisReport.push({
                        type: 'text-danger',
                        content: '挂机时间占总在线时间的' + ((data.totalTime-data.workingTime)*100 / data.totalTime).toFixed(2) + '%!挂机时间较长！'
                    });
                }
                if (data.remoteTime / data.totalTime > 0.7) {
                    $scope.analysisReport.push({
                        type: 'text-danger',
                        content: '远程在线时间占总在线时间的' + (data.remoteTime*100 / data.totalTime).toFixed(2) + '%!长时间不在实验室！'
                    });
                }
                if ($scope.analysisReport.length == 0) {
                    $scope.analysisReport.push({
                        type: 'text-warning',
                        content: '数据较少，无分析数据'
                    });
                }

            } else {
                console.log(response);
            }
        }, function (response) {
            console.log(response);
        });
    };

    $scope.getGroupStatisticsInfo = function() {
        $scope.isLoadingData = true;

        $http({
            method: 'GET',
            url: './group/statistics-info',
            params: {
                group: $scope.selectedGroupName,
                type: $scope.searchType
            }
        }).then(function (response) {
            $scope.isLoadingData = false;

            var result = response.data;
            if (result.status == 200) {
                var data = result.data;

                groupOnlineChartOption.legend.data = [];
                groupOnlineChartOption.series[0].data = [];
                groupLocalChartOption.legend.data = [];
                groupLocalChartOption.series[0].data = [];
                groupWorkingChartOption.legend.data = [];
                groupWorkingChartOption.series[0].data = [];
                for (var i = 0, iL = data.length; i < iL; i++) {
                    groupOnlineChartOption.legend.data.push(data[i].nickname || data[i].address);
                    groupOnlineChartOption.series[0].data.push({ value: data[i].totalTime, name: data[i].nickname || data[i].address});
                    groupLocalChartOption.legend.data.push(data[i].nickname || data[i].address);
                    groupLocalChartOption.series[0].data.push({ value: data[i].localTime, name: data[i].nickname || data[i].address});
                    groupWorkingChartOption.legend.data.push(data[i].nickname || data[i].address);
                    groupWorkingChartOption.series[0].data.push({ value: data[i].workingTime, name: data[i].nickname || data[i].address});
                }

                groupOnlineChart.setOption(groupOnlineChartOption);
                groupLocalChart.setOption(groupLocalChartOption);
                groupWorkingChart.setOption(groupWorkingChartOption);

            } else {
                console.log(response);
            }
        }, function (response) {
            console.log(response);
        });
    };
}