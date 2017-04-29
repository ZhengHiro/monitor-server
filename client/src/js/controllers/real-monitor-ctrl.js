/**
 * Master Controller
 */

angular.module('RDash')
    .controller('RealMonitorCtrl', ['$rootScope', '$scope', '$interval', '$timeout', RealMonitorCtrl]);

function RealMonitorCtrl($rootScope, $scope, $interval, $timeout) {
    if ($rootScope.RealTimeSystemChart) {
        $interval.cancel($rootScope.freshLineT);
        $rootScope.RealTimeSystemChart.dispose();
    }
    $scope.config = {
        legend: {
            data:['内存占用','cpu占用']
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                $rootScope.setPoint(Math.floor(new Date(params[0].name).getTime()/1000));

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
        }
    };

    $timeout(function(){
        $rootScope.RealTimeSystemChart = echarts.init(document.getElementById('real-time-system'));
        $rootScope.freshLineT = $interval(function() {
            $scope.config.series = $rootScope.realTimeSystem;
            $rootScope.RealTimeSystemChart.setOption($scope.config);
        }, 2000);
    });

}