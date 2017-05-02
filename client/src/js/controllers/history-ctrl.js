/**
 * History Controller
 */

angular.module('RDash')
    .controller('HistoryCtrl', ['$scope', '$http', '$interval', HistoryCtrl]);

function HistoryCtrl($scope, $http, $interval) {
    $interval.cancel($scope.dashFreshComputerT);
    $interval.cancel($scope.dashGetMonitorT);


    /**
     * Get computer list
     */
    $scope.selectedComputer = -1;
    $scope.isLoadingComputers = true;

    $scope.getComputerList = function () {
        $http({
            method: 'GET',
            url: './all-pc',
        }).then(function (response) {
            $scope.isLoadingComputers = false;

            var result = response.data;
            if (result.status == 200) {
                $scope.computers = result.data;
                $scope.selectComputer(0);
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
        $scope.isLoadingSystem = true;
        $scope.selectedComputer = index;
        $scope.selectedAddress = $scope.computers[index].address;

        $scope.childSelectComputer();
    };
}