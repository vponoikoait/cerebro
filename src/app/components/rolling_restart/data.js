angular.module('cerebro').factory('RollingRestartDataService', ['DataService',
  function(DataService) {
    this.getStatus = function(success, error) {
      DataService.send('rolling_restart/status', {}, success, error);
    };

    this.disableAllocation = function(kind, success, error) {
      DataService.send('rolling_restart/disable_allocation', {kind: kind}, success, error);
    };

    this.enableAllocation = function(success, error) {
      DataService.send('rolling_restart/enable_allocation', {}, success, error);
    };

    this.flushSynced = function(indices, success, error) {
      DataService.send('rolling_restart/flush_synced', {indices: indices}, success, error);
    };

    return this;
  },
]);
