'use strict';

/**
 * @ngdoc controller
 * @name udb.search.controller:QueryEditorField
 * @description
 * # QueryEditorFieldController
 */
angular
  .module('udb.search')
  .controller('QueryEditorFieldController', QueryEditorFieldController);

/* @ngInject */
function QueryEditorFieldController($scope) {

  function getParentGroup() {
    var parentGroup;

    if (isSubGroup()) {
      parentGroup = $scope.$parent.field;
    } else {
      parentGroup = $scope.rootGroup;
    }

    return parentGroup;
  }

  function getOperatorClass() {
    var operatorClass;
    if (isSubGroup() && $scope.$index === 0) {
      operatorClass = 'AND';
    } else {
      operatorClass = $scope.$index ? 'OR' : 'FIRST';
    }

    return operatorClass;
  }

  function isSubGroup() {
    var parentGroup = $scope.$parent;
    return parentGroup.field.type === 'group';
  }

  function canRemoveField() {
    var group = $scope.rootGroup;
    return (group.nodes.length > 1);
  }

  $scope.addField = function (index) {
    $scope.qe.addField(getParentGroup(), index);
  };

  $scope.removeField = function (index) {
    $scope.qe.removeField(getParentGroup(), index, $scope.rootGroup);
  };

  $scope.addSubGroup = function (index) {
    var rootGroup = $scope.rootGroup,
      treeGroupId = _.uniqueId(),
      group = getParentGroup();

    group.treeGroupId = treeGroupId;

    if (isSubGroup()) {
      index = _.findIndex(rootGroup.nodes, function (group) {
        return group.treeGroupId === treeGroupId;
      });
    }

    $scope.qe.addSubGroup(rootGroup, index);
  };

  $scope.isSubGroup = isSubGroup;
  $scope.getOperatorClass = getOperatorClass;
  $scope.canRemoveField = canRemoveField;
}
