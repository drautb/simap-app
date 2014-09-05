'use strict';

angular.module('simapApp').controller('ItemCtrl', function ($scope) {
  $scope.itemColor = '#' + (Math.random().toString(16) + '000000').slice(2, 8);

  $scope.item = {
    units: [
      { name: "cup", masterUnits: 1 },
      { name: "lb", masterUnits: 25 }
    ]
  };

  $scope.addUnit = function() {
    if (!$scope.newUnitName || $scope.newUnitName === '' ||
        !$scope.newUnitMasterUnits || $scope.newUnitMasterUnits === '') {
      return;
    }

    $scope.item.units.push({
      name: $scope.newUnitName,
      masterUnits: $scope.newUnitMasterUnits
    });

    $scope.newUnitName = '';
    $scope.newUnitMasterUnits = '';
  };

  $scope.adultRationNumber = 2;
  $scope.childRationNumber = 1;
});
