angular.module('cerebro').factory('MappingDiffDataService', ['DataService',
  function(DataService) {
    this.getIndices = function(success, error) {
      DataService.send('commons/indices', {}, success, error);
    };

    this.diff = function(indexA, indexB, success, error) {
      var data = {indexA: indexA, indexB: indexB};
      DataService.send('mapping_diff', data, success, error);
    };

    return this;
  },
]);
