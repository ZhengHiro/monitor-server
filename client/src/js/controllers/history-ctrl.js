/**
 * History Controller
 */

angular.module('RDash')
    .controller('HistoryCtrl', ['$scope', '$rootScope', '$cookieStore', '$interval', '$timeout', '$http', HistoryCtrl]);

function HistoryCtrl($rootScope, $scope, $cookieStore, $timeout, $interval, $http) {



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

    var T;

    $scope.selectComputer = function(index) {
        $scope.isLoadingSystem = true;
        $scope.selectedComputer = index;
        $scope.selectedAddress = $scope.computers[index].address;

        $scope.childSelectComputer();
    };
}