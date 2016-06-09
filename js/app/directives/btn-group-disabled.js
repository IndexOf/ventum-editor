angular.module('editor').directive('btnGroupDisabled', function() {
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            var disabled = false;
            $scope.$watch(attrs.btnGroupDisabled, function(value) {
                if (disabled !== value) {
                    disabled = value;
                    element.find('input, button, select').prop('disabled', value);
                }
            });
        }
    };
});