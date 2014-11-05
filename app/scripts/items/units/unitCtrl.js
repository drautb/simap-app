'use strict';

var app = angular.module('simapApp');

app.controller('UnitCtrl', [
  '$location',
  '$scope',
  'FirebaseService',
  'UNIT_NODE',
  function (
    $location,
    $scope,
    FirebaseService,
    UNIT_NODE
  ) {

  FirebaseService.getObject(UNIT_NODE + $scope.unitId).$bindTo($scope, 'unit');

}]);