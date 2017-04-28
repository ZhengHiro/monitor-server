window.onload = function() {
    var computers = [];
    var computerIndex = 0;
    var monitorsInfo = [];
    var monitorIndex = 0;
    var myChart = echarts.init(document.getElementById('main'));

    option = {
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

    function getMonitorInfo(startTime, endTime) {
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
                        connectNulls: true,
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
                        connectNulls: true,
                        data: cpu
                    });
                    option.series = series;

                    myChart.setOption(option);
                    document.getElementById('screen-shot').src = value.screenInfo[value.screenInfo.length-1].targetName;
                    setProcess(value.processInfo[value.processInfo.length-1].processes);
                }
            }
        });
    }

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
    }

    function setProcess(processes) {
        $('.process-list li').remove();
        for (var i = 0, iL = processes.length; i < iL; i++) {
            $('.process-list').append('<li>' + processes[i].processName + '</li>');
        }
    }

    setInterval(function () {
        var startTime = Math.floor(new Date().getTime()/1000) - 10 * 60;
        var endTime = Math.floor(new Date().getTime()/1000);
        getMonitorInfo(startTime, endTime);
    }, 2000);

    myChart.on('mouseover', function (params) {
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