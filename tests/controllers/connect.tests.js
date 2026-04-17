describe('ConnectController', function() {

  beforeEach(angular.mock.module('cerebro'));

  beforeEach(angular.mock.inject(function($rootScope, $controller, $injector) {
    this.scope = $rootScope.$new();
    this.$location = $injector.get('$location');
    this.ConnectDataService = $injector.get('ConnectDataService');
    this.AlertService = $injector.get('AlertService');
    this.createController = function() {
      return $controller('ConnectController',
        {$scope: this.scope}, this.$location, this.ConnectDataService, this.AlertService);
    };
    this._controller = this.createController();
  }));

  it('should have initial state correctly set', function() {
    expect(this.scope.hosts).toEqual(undefined);
    expect(this.scope.recentHosts).toEqual([]);
    expect(this.scope.connecting).toEqual(false);
  });

  describe('setup', function() {
    it('reads url parameters', function() {
      this.$location.search = function() {
        return {host: 'paramHost', unauthorized: true};
      };
      var hosts = ['http://somehost'];
      this.ConnectDataService.getHosts = function(success, error) {
        success(hosts);
      };
      spyOn(this.ConnectDataService, "getHosts").and.callThrough();
      spyOn(this.ConnectDataService, "getRecentHosts").and.returnValue([]);
      this.scope.setup();
      expect(this.scope.host).toEqual('paramHost');
      expect(this.scope.unauthorized).toEqual(true);
    });
    it('initializes list of known hosts', function() {
      var hosts = ['http://somehost'];
      this.ConnectDataService.getHosts = function(success, error) {
        success(hosts);
      };
      spyOn(this.ConnectDataService, "getHosts").and.callThrough();
      spyOn(this.ConnectDataService, "getRecentHosts").and.returnValue([]);
      this.scope.setup();
      expect(this.ConnectDataService.getHosts).toHaveBeenCalled();
      expect(this.scope.hosts).toEqual(hosts);
    });
    it('fails to initializes list of known hosts', function() {
      var msg = 'kaput';
      this.ConnectDataService.getHosts = function(success, error) {
        error(msg);
      };
      spyOn(this.ConnectDataService, 'getHosts').and.callThrough();
      spyOn(this.ConnectDataService, "getRecentHosts").and.returnValue([]);
      spyOn(this.AlertService, 'error').and.returnValue(true);
      this.scope.setup();
      expect(this.ConnectDataService.getHosts).toHaveBeenCalled();
      expect(this.scope.hosts).toEqual(undefined);
      expect(this.AlertService.error).toHaveBeenCalledWith('Error while fetching list of known hosts', 'kaput');
    });
  });

  describe('buildRecentHosts', function() {
    it('excludes known hosts from recent list', function() {
      this.ConnectDataService.getRecentHosts = function() {
        return ['http://localhost:9200', 'http://other:9200'];
      };
      this.scope.buildRecentHosts(['http://localhost:9200']);
      expect(this.scope.recentHosts).toEqual(['http://other:9200']);
    });
    it('returns all recent when no known hosts', function() {
      this.ConnectDataService.getRecentHosts = function() {
        return ['http://a:9200', 'http://b:9200'];
      };
      this.scope.buildRecentHosts([]);
      expect(this.scope.recentHosts).toEqual(['http://a:9200', 'http://b:9200']);
    });
    it('handles empty recent hosts', function() {
      this.ConnectDataService.getRecentHosts = function() {
        return [];
      };
      this.scope.buildRecentHosts(['http://localhost:9200']);
      expect(this.scope.recentHosts).toEqual([]);
    });
  });

  describe('removeRecentHost', function() {
    it('removes host and rebuilds list', function() {
      spyOn(this.ConnectDataService, 'removeRecentHost');
      this.ConnectDataService.getRecentHosts = function() {
        return ['http://b:9200'];
      };
      this.scope.hosts = ['http://known:9200'];
      var event = {stopPropagation: jasmine.createSpy('stopPropagation')};
      this.scope.removeRecentHost('http://a:9200', event);
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(this.ConnectDataService.removeRecentHost).toHaveBeenCalledWith('http://a:9200');
      expect(this.scope.recentHosts).toEqual(['http://b:9200']);
    });
  });

  describe('connect', function() {
    it('connects to valid host', function() {
      this.ConnectDataService.testConnection = function(host, success, error) {
        success({data: { status: 200} });
      };
      spyOn(this.ConnectDataService, "connect").and.returnValue();
      spyOn(this.ConnectDataService, "testConnection").and.callThrough();
      spyOn(this.$location, 'path').and.returnValue(true);
      this.scope.connect('http://localhost:9200');
      expect(this.ConnectDataService.connect).toHaveBeenCalledWith(
        'http://localhost:9200'
      );
      expect(this.$location.path).toHaveBeenCalledWith('/overview');
      expect(this.scope.connecting).toEqual(false);
    });
    it('connect to a secured host', function() {
      this.ConnectDataService.testConnection = function(host, success, error) {
        success({data: {status: 401} });
      };
      spyOn(this.ConnectDataService, "connect").and.returnValue(true);
      spyOn(this.ConnectDataService, "testConnection").and.callThrough();
      this.scope.connect('http://localhost:9200');
      expect(this.ConnectDataService.connect).not.toHaveBeenCalledWith(
        'http://localhost:9200'
      );
      expect(this.scope.connecting).toEqual(false);
      expect(this.scope.unauthorized).toEqual(true);
    });
    it('handles unexpected response from host', function() {
      this.ConnectDataService.testConnection = function(host, success, error) {
        success({data: {status: 301}});
      };
      spyOn(this.ConnectDataService, "connect").and.returnValue(true);
      spyOn(this.ConnectDataService, "testConnection").and.callThrough();
      this.scope.connect('http://localhost:9200');
      expect(this.ConnectDataService.connect).not.toHaveBeenCalledWith(
        'http://localhost:9200'
      );
      expect(this.scope.connecting).toEqual(false);
      expect(this.scope.feedback).toEqual('Unexpected response status: [301]');
    });
    it('handles failure connecting to host', function() {
      this.ConnectDataService.testConnection = function(host, success, error) {
        error({data: 'boom'});
      };
      spyOn(this.ConnectDataService, "testConnection").and.callThrough();
      spyOn(this.ConnectDataService, "connect").and.callThrough();
      spyOn(this.AlertService, "error").and.returnValue(true);
      this.scope.connect('http://localhost:9200');
      expect(this.ConnectDataService.connect).not.toHaveBeenCalledWith(
        'http://localhost:9200'
      );
      expect(this.scope.connecting).toEqual(false);
      expect(this.AlertService.error).toHaveBeenCalledWith(
        'Error connecting to [http://localhost:9200]',
        'boom'
      );
    });
  });

  describe('authorize', function() {
    it('connect with valid credentials', function() {
      this.ConnectDataService.testCredentials = function(host, usr, pwd, success, error) {
        success({data:{status: 200}});
      };
      spyOn(this.ConnectDataService, "connectWithCredentials").and.returnValue();
      spyOn(this.ConnectDataService, "testCredentials").and.callThrough();
      spyOn(this.$location, 'path').and.returnValue(true);
      this.scope.authorize('http://localhost:9200', 'foo', 'bar');
      expect(this.ConnectDataService.connectWithCredentials).toHaveBeenCalledWith(
        'http://localhost:9200', 'foo', 'bar'
      );
      expect(this.$location.path).toHaveBeenCalledWith('/overview');
      expect(this.scope.connecting).toEqual(false);
    });
    it('connect with invalid credentials', function() {
      this.ConnectDataService.testCredentials = function(host, usr, pwd, success, error) {
        success({data: {status: 401}});
      };
      spyOn(this.ConnectDataService, "connectWithCredentials").and.returnValue();
      spyOn(this.ConnectDataService, "testCredentials").and.callThrough();
      spyOn(this.$location, 'path').and.returnValue(true);
      this.scope.authorize('http://localhost:9200', 'foo', 'bar');
      expect(this.ConnectDataService.connectWithCredentials).not.toHaveBeenCalledWith(
        'http://localhost:9200', 'foo', 'bar'
      );
      expect(this.scope.feedback).toEqual('Invalid username or password');
      expect(this.scope.connecting).toEqual(false);
    });
    it('handles unexpected response', function() {
      this.ConnectDataService.testCredentials = function(host, usr, pwd, success, error) {
        success({data: {status: 302}});
      };
      spyOn(this.ConnectDataService, "connectWithCredentials").and.returnValue();
      spyOn(this.ConnectDataService, "testCredentials").and.callThrough();
      spyOn(this.$location, 'path').and.returnValue(true);
      this.scope.authorize('http://localhost:9200', 'foo', 'bar');
      expect(this.ConnectDataService.connectWithCredentials).not.toHaveBeenCalledWith(
        'http://localhost:9200', 'foo', 'bar'
      );
      expect(this.scope.feedback).toEqual('Unexpected response status: [302]');
      expect(this.scope.connecting).toEqual(false);
    });
    it('handles failure connecting to host', function() {
      this.ConnectDataService.testCredentials = function(host, usr, pwd, success, error) {
        error({data: 'kaput'});
      };
      spyOn(this.ConnectDataService, "connectWithCredentials").and.returnValue();
      spyOn(this.ConnectDataService, "testCredentials").and.callThrough();
      spyOn(this.AlertService, "error").and.returnValue(true);
      spyOn(this.$location, 'path').and.returnValue(true);
      this.scope.authorize('http://localhost:9200', 'foo', 'bar');
      expect(this.ConnectDataService.connectWithCredentials).not.toHaveBeenCalledWith(
        'http://localhost:9200', 'foo', 'bar'
      );
      expect(this.scope.connecting).toEqual(false);
      expect(this.AlertService.error).toHaveBeenCalledWith(
        'Error connecting to [http://localhost:9200]',
        'kaput'
      );
    });
  });

});
