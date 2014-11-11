'use strict';

angular.module('simapApp').controller('ProgressCtrl', [
  '$scope',
  'CategoriesService',
  'ProgressService',
  function (
    $scope,
    CategoriesService,
    ProgressService
  ) {

  var refreshProgressBars = function() {
    $scope.overallProgressBarItems = ProgressService.getOverallProgressBarItems();
    $scope.progressBarItems = {};

    Object.keys(CategoriesService.getCategories()).forEach(function(categoryId) {
      $scope.progressBarItems[categoryId] = ProgressService.getCategoryProgressBarItems(categoryId);
    });
  };

  $scope.baselinesMet = function() {
    return ProgressService.countMetBaselines($scope.categoryId);
  };

  $scope.totalBaselines = function() {
    return ProgressService.countTotalBaselines($scope.categoryId);
  };

  $scope.rationProgress = function() {
    return ProgressService.calculateRationProgress($scope.categoryId) * 100;
  };

  refreshProgressBars();

}]);