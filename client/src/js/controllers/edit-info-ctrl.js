/**
 * Master Controller
 */

angular.module('RDash')
    .controller('EditInfoCtrl', ['$scope', '$rootScope', '$cookieStore', '$interval', '$http', EditInfoCtrl]);

function EditInfoCtrl($rootScope, $scope, $cookieStore, $interval, $http) {
    /**
     * Get computer list
     */
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
            } else {
                console.log(response);
            }
        }, function (response) {
            $scope.isLoadingComputers = false;

            console.log(response);
        });
    };

    $scope.getComputerList();

    $scope.edit = function(index) {
        $scope.editIndex = index;
        if (index == -1) {
            return ;
        }
        $scope.editNickname = $scope.computers[index].nickname;
        $scope.editGroup = $scope.computers[index].group;
    };

    $scope.save = function(index, name, group) {
        $scope.editIndex = -1;
        $scope.computers[index].nickname = name;
        $scope.computers[index].group = group;
        $http({
            method: 'POST',
            url: './pc-info',
            data: {
                address: $scope.computers[index].address,
                nickname: name,
                group: group
            }
        }).then(function (response) {
            $scope.isLoadingComputers = true;
            $scope.getComputerList();
        }, function (response) {
            console.log(response);
        });
    }
}