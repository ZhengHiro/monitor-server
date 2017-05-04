'use strict';

/**
 * Route configuration for the RDash module.
 */
angular.module('RDash').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        // For unmatched routes
        $urlRouterProvider.otherwise('/');

        // Application routes
        $stateProvider
            .state('/', {
                url: '/',
                templateUrl: 'templates/dashboard.html'
            })
            .state('edit', {
                url: '/edit-info',
                templateUrl: 'templates/editInfo.html'
            })
            .state('statistics', {
                url: '/statistics',
                templateUrl: 'templates/statistics.html'
            })
            .state('history', {
                url: '/history',
                templateUrl: 'templates/history.html'
            });
    }
]);