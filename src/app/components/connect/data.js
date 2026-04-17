angular.module('cerebro').factory('ConnectDataService', ['$http', '$window',
  'DataService',
  function($http, $window, DataService) {
    var STORAGE_KEY = 'cerebro:recentHosts';
    var MAX_RECENT = 15;

    // --- localStorage helpers for recent hosts ---

    this.getRecentHosts = function() {
      try {
        var raw = $window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    };

    this.saveRecentHost = function(host) {
      if (!host) return;
      var recent = this.getRecentHosts();
      // Remove duplicate (case-insensitive match on trimmed value)
      var normalized = host.trim().toLowerCase();
      recent = recent.filter(function(h) {
        return h.trim().toLowerCase() !== normalized;
      });
      // Prepend most recent
      recent.unshift(host.trim());
      // Cap the list
      if (recent.length > MAX_RECENT) {
        recent = recent.slice(0, MAX_RECENT);
      }
      try {
        $window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
      } catch (e) {
        // localStorage full or unavailable — silently ignore
      }
    };

    this.removeRecentHost = function(host) {
      if (!host) return;
      var normalized = host.trim().toLowerCase();
      var recent = this.getRecentHosts().filter(function(h) {
        return h.trim().toLowerCase() !== normalized;
      });
      try {
        $window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
      } catch (e) {
        // ignore
      }
    };

    // --- Server-side known hosts ---

    this.getHosts = function(success, error) {
      var config = {method: 'GET', url: 'connect/hosts'};
      var handleSuccess = function(response) {
        if (response.data.status >= 200 && response.data.status < 300) {
          success(response.data.body);
        } else {
          error(response.data.body);
        }
      };
      var handleError = function(response) {
        error(response.data.body);
      };
      $http(config).then(handleSuccess, handleError);
    };

    // --- Connection ---

    this.testConnection = function(host, success, error) {
      var config = {method: 'POST', url: 'connect', data: {host: host}};
      $http(config).then(success, error);
    };

    this.testCredentials = function(host, username, password, success, error) {
      var data = {host: host, username: username, password: password};
      var config = {method: 'POST', url: 'connect', data: data};
      $http(config).then(success, error);
    };

    this.connect = function(host) {
      this.saveRecentHost(host);
      DataService.setHost(host);
    };

    this.connectWithCredentials = function(host, username, password) {
      this.saveRecentHost(host);
      DataService.setHost(host, username, password);
    };

    return this;
  },
]);
