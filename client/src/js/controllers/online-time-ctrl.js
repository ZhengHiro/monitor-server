/**
 * Online Time Controller
 */

angular.module('RDash')
    .controller('OnlineTimeCtrl', ['$rootScope', '$scope', '$interval', '$timeout', '$http', OnlineTimeCtrl]);

function OnlineTimeCtrl($rootScope, $scope, $interval, $timeout, $http) {
    /**
     * Set Time
     */
    $scope.selectYear = 2017;
    $scope.selectMonth = 4;
    $scope.lastYear = function() {
        $scope.selectYear--;
        customGetTime();
        $scope.getOnlineTime();
    };
    $scope.nextYear = function() {
        $scope.selectYear++;
        customGetTime();
        $scope.getOnlineTime();
    };
    $scope.lastMonth = function() {
        $scope.selectMonth--;
        if ($scope.selectMonth <= 0) {
            $scope.selectYear--;
            $scope.selectMonth = 12;
        }
        customGetTime();
        $scope.getOnlineTime();
    };
    $scope.nextMonth = function() {
        $scope.selectMonth++;
        if ($scope.selectMonth > 12) {
            $scope.selectYear++;
            $scope.selectMonth = 1;
        }
        customGetTime();
        $scope.getOnlineTime();
    };
    var startTime, endTime;
    function customGetTime() {
        var startDate = $scope.selectYear + '-' + $scope.selectMonth;
        var endDate = $scope.selectYear + '-' + ($scope.selectMonth+1);
        startTime = Math.floor(new Date(startDate).getTime() / 1000);
        endTime = Math.floor(new Date(endDate).getTime() / 1000);
    }
    customGetTime();

    var timeChart, option, localTimeChart, localTimeOption, systemChart, systemChartOption, processRateChart, processRateOption;

    $timeout(function() {
        timeChart = echarts.init(document.getElementById('online-time-chart'));
        localTimeChart = echarts.init(document.getElementById('local-time-chart'));
        systemChart = echarts.init(document.getElementById('system-chart'));
        processRateChart = echarts.init(document.getElementById('process-rate-chart'));

        option = {
            tooltip: {
                position: 'top',
                formatter: function(params) {
                    return (params.data[0] + '<br/> 本地登录:' + Math.round(params.data[1]/60)+ '分钟' + '<br/> 远程登录:' + Math.round(params.data[2]/60)+ '分钟');
                }
            },
            visualMap: {
                show: false,
                color: ['#1790cf', '#a2d4e6'],
                min: 0,
                max: 24*60*60
            },
            calendar: {
                range: $scope.selectYear + '-' + $scope.selectMonth,
                orient: 'vertical',
                dayLabel: {
                    nameMap: 'cn'
                },
                monthLabel: {
                    nameMap: 'cn'
                },
                cellSize: [35, 35]
            },
            series: {
                type: 'heatmap',
                coordinateSystem: 'calendar',
            }
        };

        localTimeOption = {
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: ['本地登录','远程登录']
            },
            series : [
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
                    }
                }
            ]
        };

        systemChartOption = {
            legend: {
                data:['内存占用','cpu占用']
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    $scope.setPoint(Math.floor(new Date(params[0].name).getTime()/1000));

                    var date = new Date(params[0].name);
                    var time = '<div>' + date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '</div>';
                    var temp1 = '<div style="width: 10px;height: 10px; margin-right: 10px; display: inline-block; border-radius: 50%; background: ' + params[0].color + '"></div><div style="display: inline-block">' + params[0].seriesName + ': ' + params[0].value[1] + '</div><br/>';

                    var temp2 = '<div style="width: 10px;height: 10px; margin-right: 10px; display: inline-block; border-radius: 50%; background: ' + params[1].color + '"></div><div style="display: inline-block">' + params[1].seriesName + ': ' + params[1].value[1] + '</div>';
                    return time + temp1 + temp2;
                }
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                max: 100,
                min: 0,
                splitLine: {
                    show: false
                },
                axisLabel: {
                    formatter: '{value} %'
                }
            },
            dataZoom: [{
                start: 90,
                end: 100
            }, {
                type: 'inside'
            }]
        };

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


        timeChart.on('click', function (params) {
            localTimeOption.series[0].data = [
                { value: params.data[1], name:'本地登录'},
                { value: params.data[2], name:'远程登录'},
            ];
            localTimeChart.setOption(localTimeOption);
            $scope.getComputerMonitor(params.data[0]);
            $scope.getProcessRate(params.data[0]);
        });
    });

    $scope.getOnlineTime = function() {
        if (localTimeOption) {
            localTimeChart.clear();
        }
        $http({
            method: 'GET',
            url: './online-time',
            params: {
                address: $rootScope.selectedAddress,
                startTime: startTime,
                endTime: endTime
            }
        }).then(function (response) {
            var result = response.data;
            if (result.status == 200) {
                var data = result.data;
                var seriesData = [];
                for (var i = 0, iL = data.length; i < iL; i++) {
                    seriesData.push([
                        echarts.format.formatTime('yyyy-MM-dd', data[i].dateTime*1000),
                        data[i].localTime,
                        data[i].remoteTime,
                        data[i].totalTime
                    ]);
                }
                if (option) {
                    option.calendar.range = $scope.selectYear + '-' + $scope.selectMonth;
                    option.series.data = seriesData;
                    timeChart.setOption(option);
                }
            } else {
                console.log(response);
            }
        }, function (response) {
            console.log(response);
        });
    };

    $scope.getOnlineTime();

    $scope.isLoadingSystemOnce = false;

    $scope.getComputerMonitor = function (date) {
        var time = Math.floor(new Date(date).getTime()/1000);
        $scope.isLoadingSystemOnce = true;
        $scope.$apply();

        $http({
            method: 'GET',
            url: './monitor-info',
            params: {
                address: $rootScope.selectedAddress,
                startTime: time,
                endTime: time+60*60*24
            }
        }).then(function (response) {
            $scope.isLoadingSystemOnce = false;

            var result = response.data;

            if (result.status == 200) {
                var data = result.data;
                var memory = [];
                var date;
                var series = [];

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
                    connectNulls: false,
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

                systemChartOption.series = series;
                systemChart.setOption(systemChartOption);

                $scope.monitorInfos = data;

            } else {
                console.log(response);
            }
        }, function (response) {
            console.log(response);
        });
    };

    $scope.getProcessRate = function (date) {
        var time = Math.floor(new Date(date).getTime()/1000);
        processRateOption.series[0].data = [];
        processRateOption.legend.data = [];


        $http({
            method: 'GET',
            url: './process-rate',
            params: {
                address: $rootScope.selectedAddress,
                dateTime: time
            }
        }).then(function (response) {
            var result = response.data;

            if (result.status == 200) {
                var data = result.data;
                data.sort(function(a, b) {
                    return b.totalMem - a.totalMem;
                });

                var tag = false, otherProcess = 0;
                for (var i = 0, iL = data.length; i < iL; i++) {
                    if (i < 10) {
                        processRateOption.legend.data.push(data[i].processName);
                        processRateOption.series[0].data.push({
                            value: data[i].totalMem,
                            name: data[i].processName
                        });
                    } else if (!tag) {
                        tag = true;
                        otherProcess += data[i].totalMem;
                        processRateOption.legend.data.push('其他');
                    } else {
                        otherProcess += data[i].totalMem;
                    }
                }
                if (otherProcess) {
                    processRateOption.series[0].data.push({
                        value: otherProcess,
                        name: '其他'
                    });
                }
                processRateChart.setOption(processRateOption);
            } else {
                console.log(response);
            }
        }, function (response) {
            console.log(response);
        });
    };


    //父级触发
    $rootScope.childSelectComputer = function() {
        $scope.getOnlineTime();
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