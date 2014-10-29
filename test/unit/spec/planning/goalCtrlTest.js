'use strict';

describe('Controller: GoalCtrl', function() {

  var mockSession,
      mockFirebaseRef,
      $firebaseRet,
      $firebaseGoalObj,
      deferredBind,
      $rootScope;

  var GoalCtrl,
      $scope,
      $firebase,
      FirebaseService,
      SessionService;

  beforeEach(function() {
    module('simapApp');
  });

  beforeEach(inject(function ($controller, _$rootScope_, $q) {
    mockSession = { goal_id: 'goal-id-lskdfj' };

    $firebaseGoalObj = jasmine.createSpyObj('$firebaseGoalObj', ['$bindTo']);
    deferredBind = $q.defer();
    $firebaseGoalObj.$bindTo.and.returnValue(deferredBind.promise);

    $firebaseRet = jasmine.createSpyObj('$firebaseRet', ['$asObject']);
    $firebaseRet.$asObject.and.returnValue($firebaseGoalObj);

    $firebase = jasmine.createSpy('$firebase').and.returnValue($firebaseRet);

    mockFirebaseRef = jasmine.createSpyObj('mockFirebaseRef', ['child']);
    mockFirebaseRef.child.and.callFake(function(node) { return node; });

    FirebaseService = jasmine.createSpyObj('FirebaseService', ['getRef']);
    FirebaseService.getRef.and.returnValue(mockFirebaseRef);

    SessionService = jasmine.createSpyObj('SessionService', ['currentSession']);
    SessionService.currentSession.and.returnValue(mockSession);

    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $scope.days = { $value: 365 };

    GoalCtrl = $controller('GoalCtrl', {
      $scope: $scope,
      $firebase: $firebase,
      FirebaseService: FirebaseService,
      SessionService: SessionService
    });
  }));

  describe('initialization', function() {
    it('should get the goal_id from the current session', function() {
      expect(SessionService.currentSession).toHaveBeenCalled();
    });

    it('should get a reference to the goal\s days', function() {
      expect(mockFirebaseRef.child).toHaveBeenCalledWith('goal/goal-id-lskdfj/days');
    });

    it('should bind the days object to $scope.days', function() {
      expect($firebaseGoalObj.$bindTo).toHaveBeenCalledWith($scope, 'days');
    });

    it('should convert the days to months for the view', function() {
      deferredBind.resolve();
      $rootScope.$digest();

      expect($scope.months).toBe(12);
    });

    it('should update the prepared until date', function() {
      deferredBind.resolve();
      $rootScope.$digest();

      expect($scope.preparedUntilDate).toMatch(/^[A-Za-z]+ \d{1,2}, \d{4}$/);
    });
  });

  describe('monthsChanged', function() {
    it('should not do anything if months is undefined', function() {
      $scope.months = undefined;
      $scope.days.$value = 365;

      $scope.monthsChanged();

      expect($scope.days.$value).toBe(365);
    });

    it('should not do anything if months is null', function() {
      $scope.months = null;
      $scope.days.$value = 365;

      $scope.monthsChanged();

      expect($scope.days.$value).toBe(365);
    });

    it('should convert months to days', function() {
      $scope.months = 2;

      $scope.monthsChanged();

      expect($scope.days.$value).toBe(61);
    });

    it('should update the prepared until date', function() {
      var oldDate = $scope.preparedUntilDate;
      $scope.months = $scope.months + 1;

      $scope.monthsChanged();

      expect($scope.preparedUntilDate).not.toBe(oldDate);
    });
  });

});
