'use strict';

describe('Service: SessionService', function() {

  var user,
      $firebaseObj,
      firebaseRef,
      syncedUser,
      mockUserNode,
      $rootScope,
      deferredLoaded;

  // Injected dependencies
  var SessionService,
      $log,
      $location,
      $firebase,
      FirebaseService;

  beforeEach(function() {
    module('simapApp');
  });

  beforeEach(module('simapApp', function($provide) {
    user = {
      uid: 'test:123'
    };

    mockUserNode = 'mock-user-node';

    $log = jasmine.createSpyObj('$log', ['debug', 'error']);
    $location = jasmine.createSpyObj('$location', ['path']);

    syncedUser = jasmine.createSpyObj('syncedUser', ['$loaded', '$destroy']);
    $firebaseObj = jasmine.createSpyObj('$firebaseObj', ['$asObject'])
    $firebaseObj.$asObject.and.callFake(function() { return syncedUser; });
    $firebase = jasmine.createSpy('$firebase').and.returnValue($firebaseObj);

    firebaseRef = jasmine.createSpyObj('firebaseRef', ['child']);
    firebaseRef.child.and.callFake(function() { return mockUserNode; });
    FirebaseService = jasmine.createSpyObj('FirebaseService', ['getRef']);
    FirebaseService.getRef.and.callFake(function() { return firebaseRef; });

    $provide.value('$log', $log);
    $provide.value('$location', $location);
    $provide.value('$firebase', $firebase);
    $provide.value('FirebaseService', FirebaseService);
  }));

  beforeEach(inject(function (_SessionService_, _$rootScope_, $q) {
    SessionService = _SessionService_;
    $rootScope = _$rootScope_;

    deferredLoaded = $q.defer();
    syncedUser.$loaded.and.returnValue(deferredLoaded.promise);
  }));

  it('should have a null session to start with', function() {
    expect(SessionService.currentSession()).toBeNull();
  });

  describe('startSession', function() {
    it('should use the correct user node', function() {
      SessionService.startSession(user);

      expect(firebaseRef.child).toHaveBeenCalledWith('user/' + user.uid);
    });

    it('should create a new $firebase reference to the user', function() {
      SessionService.startSession(user);

      expect($firebase).toHaveBeenCalledWith(mockUserNode);
    });

    it('should call $asObject on the reference', function() {
      SessionService.startSession(user);

      expect($firebaseObj.$asObject).toHaveBeenCalled();
    });

    it('should redirect the user to /home once the user has been loaded', function() {
      SessionService.startSession(user);
      deferredLoaded.resolve();
      $rootScope.$digest();

      expect($location.path).toHaveBeenCalledWith('/home');
    });

    it('should close the session if an error occurred', function() {
      SessionService.startSession(user);
      deferredLoaded.reject();
      $rootScope.$digest();

      expect(syncedUser.$destroy).toHaveBeenCalled();
    });
  });

  describe('closeSession', function() {
    it('should call $destroy on the syncedUser object', function() {
      SessionService.startSession(user);
      SessionService.closeSession();

      expect(syncedUser.$destroy).toHaveBeenCalled();
    });

    it('should not try to call $destroy on a null syncedUser object', function() {
      SessionService.closeSession();

      expect(syncedUser.$destroy).not.toHaveBeenCalled();
    });
  });

});
