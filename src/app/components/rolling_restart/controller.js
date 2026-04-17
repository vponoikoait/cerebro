angular.module('cerebro').controller('RollingRestartController', ['$scope',
  '$interval', 'RollingRestartDataService', 'AlertService',
  function($scope, $interval, RollingRestartDataService, AlertService) {
    $scope.step = 1;
    $scope.status = undefined;
    $scope.polling = undefined;

    $scope.steps = [
      {num: 1, title: 'Check cluster health', icon: 'fa-heartbeat'},
      {num: 2, title: 'Disable shard allocation', icon: 'fa-ban'},
      {num: 3, title: 'Flush indices', icon: 'fa-download'},
      {num: 4, title: 'Restart node', icon: 'fa-refresh'},
      {num: 5, title: 'Re-enable allocation', icon: 'fa-check'},
      {num: 6, title: 'Wait for green', icon: 'fa-hourglass-half'},
    ];

    $scope.setup = function() {
      $scope.refreshStatus();
    };

    $scope.refreshStatus = function() {
      RollingRestartDataService.getStatus(
          function(data) {
            $scope.status = data;
          },
          function(error) {
            AlertService.error('Error fetching cluster status', error);
          }
      );
    };

    $scope.disableAllocation = function() {
      RollingRestartDataService.disableAllocation('none',
          function() {
            AlertService.success('Shard allocation disabled');
            $scope.step = 3;
            $scope.refreshStatus();
          },
          function(error) {
            AlertService.error('Failed to disable allocation', error);
          }
      );
    };

    $scope.flushIndices = function() {
      RollingRestartDataService.flushSynced('_all',
          function() {
            AlertService.success('Flush completed');
            $scope.step = 4;
          },
          function(error) {
            AlertService.error('Flush failed', error);
          }
      );
    };

    $scope.nodeRestarted = function() {
      $scope.step = 5;
      $scope.refreshStatus();
    };

    $scope.enableAllocation = function() {
      RollingRestartDataService.enableAllocation(
          function() {
            AlertService.success('Shard allocation re-enabled');
            $scope.step = 6;
            $scope.refreshStatus();
            $scope.startPolling();
          },
          function(error) {
            AlertService.error('Failed to enable allocation', error);
          }
      );
    };

    $scope.startPolling = function() {
      if ($scope.polling) return;
      $scope.polling = $interval(function() {
        $scope.refreshStatus();
        if ($scope.status && $scope.status.status === 'green' &&
            $scope.status.relocating_shards === 0 &&
            $scope.status.initializing_shards === 0) {
          $scope.stopPolling();
          AlertService.success('Cluster is green — ready for next node');
        }
      }, 5000);
    };

    $scope.stopPolling = function() {
      if ($scope.polling) {
        $interval.cancel($scope.polling);
        $scope.polling = undefined;
      }
    };

    $scope.reset = function() {
      $scope.stopPolling();
      $scope.step = 1;
      $scope.refreshStatus();
    };

    $scope.nextNode = function() {
      $scope.stopPolling();
      $scope.step = 2;
      $scope.refreshStatus();
    };

    $scope.$on('$destroy', function() {
      $scope.stopPolling();
    });
  }]
);
