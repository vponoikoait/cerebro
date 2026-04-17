'use strict';
angular.module('cerebro', ['ngRoute', 'ngAnimate', 'ui.bootstrap'])
    .config(['$routeProvider',
      function($routeProvider) {
        var v = '?v=095b';
        $routeProvider
            .when('/overview', {
              templateUrl: 'overview.html' + v,
              controller: 'OverviewController',
            })
            .when('/nodes', {
              templateUrl: 'nodes/index.html' + v,
              controller: 'NodesController',
            })
            .when('/connect', {
              templateUrl: 'connect.html' + v,
              controller: 'ConnectController',
            })
            .when('/rest', {
              templateUrl: 'rest/index.html' + v,
              controller: 'RestController',
            })
            .when('/aliases', {
              templateUrl: 'aliases.html' + v,
              controller: 'AliasesController',
            })
            .when('/create', {
              templateUrl: 'create_index.html' + v,
              controller: 'CreateIndexController',
            })
            .when('/analysis', {
              templateUrl: 'analysis/index.html' + v,
              controller: 'AnalysisController',
            })
            .when('/templates', {
              templateUrl: 'templates/index.html' + v,
              controller: 'TemplatesController',
            })
            .when('/cluster_settings', {
              templateUrl: 'cluster_settings/index.html' + v,
              controller: 'ClusterSettingsController',
            })
            .when('/index_settings', {
              templateUrl: 'index_settings/index.html' + v,
              controller: 'IndexSettingsController',
            })
            .when('/snapshot', {
              templateUrl: 'snapshot/index.html' + v,
              controller: 'SnapshotController',
            })
            .when('/repository', {
              templateUrl: 'repositories/index.html' + v,
              controller: 'RepositoriesController',
            })
            .when('/cat', {
              templateUrl: 'cat/index.html' + v,
              controller: 'CatController',
            })
            .when('/mapping_diff', {
              templateUrl: 'mapping_diff/index.html' + v,
              controller: 'MappingDiffController',
            })
            .when('/rolling_restart', {
              templateUrl: 'rolling_restart/index.html' + v,
              controller: 'RollingRestartController',
            })
            .otherwise({
              redirectTo: '/connect',
            }
            );
      },
    ]);
