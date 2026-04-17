angular.module('cerebro').controller('MappingDiffController', ['$scope',
  'MappingDiffDataService', 'AlertService',
  function($scope, MappingDiffDataService, AlertService) {
    $scope.indices = [];
    $scope.indexA = '';
    $scope.indexB = '';
    $scope.result = undefined;

    $scope.setup = function() {
      MappingDiffDataService.getIndices(
          function(indices) {
            $scope.indices = indices;
          },
          function(error) {
            AlertService.error('Error loading indices', error);
          }
      );
    };

    $scope.compare = function() {
      if (!$scope.indexA || !$scope.indexB) {
        AlertService.warn('Please select two indices to compare');
        return;
      }
      if ($scope.indexA === $scope.indexB) {
        AlertService.warn('Please select two different indices');
        return;
      }
      $scope.result = undefined;
      MappingDiffDataService.diff($scope.indexA, $scope.indexB,
          function(data) {
            $scope.result = $scope.computeDiff(data.indexA, data.indexB);
          },
          function(error) {
            AlertService.error('Error loading mappings', error);
          }
      );
    };

    $scope.computeDiff = function(a, b) {
      var fieldsA = $scope.flattenMapping(a.mappings);
      var fieldsB = $scope.flattenMapping(b.mappings);
      var allKeys = Object.keys(fieldsA).concat(Object.keys(fieldsB));
      var uniqueKeys = allKeys.filter(function(v, i, arr) {
        return arr.indexOf(v) === i;
      }).sort();

      var rows = [];
      uniqueKeys.forEach(function(key) {
        var valA = fieldsA[key];
        var valB = fieldsB[key];
        var status;
        if (!valA) {
          status = 'added';
        } else if (!valB) {
          status = 'removed';
        } else if (JSON.stringify(valA) !== JSON.stringify(valB)) {
          status = 'changed';
        } else {
          status = 'same';
        }
        rows.push({
          field: key,
          typeA: valA ? (valA.type || 'object') : '-',
          typeB: valB ? (valB.type || 'object') : '-',
          detailA: valA ? JSON.stringify(valA, null, 2) : '',
          detailB: valB ? JSON.stringify(valB, null, 2) : '',
          status: status,
        });
      });

      return {
        nameA: a.name,
        nameB: b.name,
        rows: rows,
        stats: {
          total: rows.length,
          same: rows.filter(function(r) { return r.status === 'same'; }).length,
          changed: rows.filter(function(r) { return r.status === 'changed'; }).length,
          added: rows.filter(function(r) { return r.status === 'added'; }).length,
          removed: rows.filter(function(r) { return r.status === 'removed'; }).length,
        },
      };
    };

    // Flatten nested mapping properties into dot-notation keys
    $scope.flattenMapping = function(mapping, prefix) {
      var result = {};
      var props = mapping.properties || mapping;
      if (!props || typeof props !== 'object') return result;

      Object.keys(props).forEach(function(key) {
        var fullKey = prefix ? prefix + '.' + key : key;
        var val = props[key];
        if (val && val.properties) {
          // Object/nested type — recurse
          var nested = $scope.flattenMapping(val, fullKey);
          angular.extend(result, nested);
        } else {
          result[fullKey] = val;
        }
      });
      return result;
    };

    $scope.showDiffsOnly = false;

    $scope.filteredRows = function() {
      if (!$scope.result) return [];
      if ($scope.showDiffsOnly) {
        return $scope.result.rows.filter(function(r) {
          return r.status !== 'same';
        });
      }
      return $scope.result.rows;
    };
  }]
);
