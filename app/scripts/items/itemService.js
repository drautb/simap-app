'use strict';

var app = angular.module('simapApp');

app.service('ItemService', [
  '$firebase',
  '$q',
  'DEFAULT_ITEM_NAME',
  'FirebaseService',
  'GuidService',
  'ITEM_NODE',
  'PlanService',
  'randomColor',
  'SessionService',
  'UnitService',
  function(
    $firebase,
    $q,
    DEFAULT_ITEM_NAME,
    FirebaseService,
    GuidService,
    ITEM_NODE,
    PlanService,
    randomColor,
    SessionService,
    UnitService
  ) {

  var firebaseRef = FirebaseService.getRef();

  this.createNew = function() {
    var uid = SessionService.currentSession('uid'),
        newItemId = GuidService.generateGuid();

    var newItemObj = FirebaseService.getObject(ITEM_NODE + newItemId);

    return newItemObj.$loaded().then(function() {
      newItemObj.owner = uid;
      newItemObj.name = DEFAULT_ITEM_NAME;
      newItemObj.color = randomColor();
      newItemObj.category_id = Object.keys(SessionService.currentSession('categories'))[0];
      newItemObj.amount = 0;

      var newUnitPromise = UnitService.createNew().then(function(newUnitId) {
        newItemObj.units = {};
        newItemObj.units[newUnitId] = true;
        newItemObj.primary_unit = newUnitId;

        return PlanService.createRationPlan(newUnitId).then(function(newPlanId) {
          newItemObj.plan_id = newPlanId;
        });
      });

      return newUnitPromise.then(function() {
        return newItemObj.$save();
      }).then(function() {
        return SessionService.bindToUser('items', newItemId);
      });
    }).finally(function() {
      newItemObj.$destroy();
    });
  };

  this.removeOld = function(itemId) {
    if (SessionService.currentSession('items')[itemId] !== true) {
      return;
    }

    var itemObj = FirebaseService.getObject(ITEM_NODE + itemId);

    return itemObj.$loaded().then(function() {
      var unitRemovalPromises = [];
      Object.keys(itemObj.units).forEach(function(unitId) {
        unitRemovalPromises.push(UnitService.removeOld(unitId));
      });

      return $q.all(unitRemovalPromises).then(function() {
        return PlanService.removePlan(itemObj.plan_id).then(function() {
          return $firebase(firebaseRef.child(ITEM_NODE + itemId)).$remove().then(function() {
            return SessionService.unbindFromUser('items', itemId);
          });
        });
      });
    }).finally(function() {
      itemObj.$destroy();
    });
  };

}]);
