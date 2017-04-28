window.onload = function() {
    var computers;
    var computerIndex = 0;
    var monitorsInfo;

    var date = new Date();
    var year = date.getFullYear(), month = date.getMonth()+1;
    var startDate, endDate, startTime, endTime;
    customGetTime();

    function customGetTime() {
        startDate = year + '-' + month;
        endDate = year + '-' + (month+1);
        startTime = Math.floor(new Date(startDate).getTime() / 1000);
        endTime = Math.floor(new Date(endDate).getTime() / 1000);
    }

    $('.current-year').text(year+'年');
    $('.current-month').text(month+'月');
    $('.last-year').click(function() {
        year--;
        $('.current-year').text(year+'年');
        customGetTime();
        getOnlineTime();
    });
    $('.next-year').click(function() {
        year++;
        $('.current-year').text(year+'年');
        customGetTime();
        getOnlineTime();
    });
    $('.last-month').click(function() {
        month--;
        if (month <= 0) {
            year--;
            month = 12;
        }
        $('.current-year').text(year+'年');
        $('.current-month').text(month+'月');
        customGetTime();
        getOnlineTime();
    });
    $('.next-month').click(function() {
        month++;
        if (month > 12) {
            year++;
            month = 1;
        }
        $('.current-year').text(year+'年');
        $('.current-month').text(month+'月');
        customGetTime();
        getOnlineTime();
    });


    var myChart = echarts.init(document.getElementById('main'));

    var option = {
        tooltip: {
            position: 'top',
            formatter: function(params) {
                return (params.data[0] + '<br/>' + Math.round(params.data[1]/60)+ '分钟');
            }
        },
        visualMap: {
            show: false,
            min: 0,
            max: 8*60*60
        },
        calendar: {
            range: year + '-' + month,
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
            type: 'effectScatter',
            symbolSize: function (val) {
                return (val[1]*35) / (8*60*60) ;
            },
            coordinateSystem: 'calendar',
        }
    };

    function setList() {
        $.ajax({
            url: './all-pc',
            type: 'GET',
            success: function(result) {
                if(result.status = 200) {
                    computers = result.data;
                    var list = $('.computer-list');
                    $('.computer-list li').remove();
                    for (var i = 0, iL = computers.length; i < iL; i++) {
                        list.append("<li>" + (computers[i].nickname || computers[i].address) + "<i class='glyphicon glyphicon-pencil'></i></li>");
                    }
                    $('.computer-list li').click(function() {
                        selectComputer($(this).index());
                    });
                    selectComputer(0);
                    $('.computer-list li>i.glyphicon-pencil').click(function() {
                        var li = $(this).parent('li');
                        var index = $(li).index();
                        li.html("<input type='text' value='" + (computers[index].nickname || computers[index].address) + "'><i class='glyphicon glyphicon-floppy-disk'></i>");
                        $('.computer-list li>i.glyphicon-floppy-disk').click(function() {
                            setNickName(computers[index].address, li.children('input')[0].value);
                        });
                    });
                }
            }
        });
    }

    function setNickName(address, nickname) {
        $.ajax({
            url: './pc-nickname',
            type: 'POST',
            data: {
                address: address,
                nickname: nickname
            },
            success: function(result) {
                setList();
            }
        });
    }

    function selectComputer(index) {
        computerIndex = index;
        var list = $('.computer-list li');
        for (var i = 0, iL = list.length; i < iL; i++) {
            if (i == computerIndex) {
                $(list[i]).addClass('active');
            } else {
                $(list[i]).removeClass('active');
            }
        }
        getOnlineTime();
    }

    function getOnlineTime() {
        $.ajax({
            url: './online-time',
            type: 'GET',
            data: {
                address: computers[computerIndex].address,
                startTime: startTime,
                endTime: endTime
            },
            success: function(result) {
                if(result.status = 200) {
                    var data = result.data;
                    var seriesData = [];
                    for (var i = 0, iL = data.length; i < iL; i++) {
                        seriesData.push([
                            echarts.format.formatTime('yyyy-MM-dd', data[i].dateTime*1000),
                            data[i].totalTime
                        ])
                    }
                    option.calendar.range = year + '-' + month;
                    option.series.data = seriesData;
                    myChart.setOption(option);
                }
            }
        });
    }

    var lineChart = echarts.init(document.getElementById('line-chart'));

    lineOption = {
        title: {
            text: '实时监控'
        },
        legend: {
            data:['内存占用','cpu占用']
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'time',
            splitLine: {
                show: false
            }
        },
        dataZoom: [{
            start: 90,
            end: 100
        }, {
            type: 'inside'
        }],
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
        }
    };

    function selectDay(date) {
        var startTime = Math.floor(new Date(date).getTime()/1000);
        var endTime = startTime + 24*60*60;
        $.ajax({
            url: './monitor-info',
            type: 'GET',
            data: {
                "startTime": startTime,
                "endTime": endTime
            },
            success: function(result) {
                if(result.status = 200) {
                    var data = result.data;
                    var series = [];
                    monitorsInfo = data;

                    monitorsInfo.forEach(function(monitor, i) {
                        if (monitor.address == computers[computerIndex].address) {
                            monitorIndex = i;
                        }
                    });

                    var value = data[monitorIndex];
                    var memory = [];
                    var date;

                    value.systemInfo.forEach(function(row) {
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
                    value.systemInfo.forEach(function(row) {
                        date = new Date(row.time * 1000);
                        // if(row.cpuUsed > 100) {
                        //     row.cpuUsed = 100;
                        // }
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
                        connectNulls: false,
                        data: cpu
                    });
                    lineOption.series = series;

                    lineChart.clear();
                    lineChart.setOption(lineOption);
                    document.getElementById('screen-shot').src = value.screenInfo[value.screenInfo.length-1].targetName;
                    setProcess(value.processInfo[value.processInfo.length-1].processes);
                }
            }
        });
    }

    myChart.on('click', function (params) {
        selectDay(params.value[0]);
    });

    function setProcess(processes) {
        $('.process-list li').remove();
        for (var i = 0, iL = processes.length; i < iL; i++) {
            $('.process-list').append('<li>' + processes[i].processName + '</li>');
        }
    }

    lineChart.on('mouseover', function (params) {
        var time = Math.floor(new Date(params.name).getTime()/1000);
        var value = monitorsInfo[monitorIndex];

        var minDis;
        for (var i = 0, iL = value.screenInfo.length; i < iL; i++) {
            var realDis = value.screenInfo[i].time - time;

            if (realDis < 0) {
                realDis = -realDis;
            }
            if (realDis <= minDis || minDis == undefined) {
                minDis = realDis;
            }
            if (realDis > minDis) {
                break;
            }
        }
        document.getElementById('screen-shot').src = value.screenInfo[i].targetName;
    });

    setList();
};