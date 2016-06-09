/**
 * Рабочая область
 */
angular.module('editor').directive('workspace', function($rootScope) {

    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            $rootScope.workspaceWidth = element[0].offsetWidth;
            $rootScope.workspaceHeight = Math.round($rootScope.workspaceWidth / 1.74);
        }
    };

});

angular.module('editor').directive('canvasFabric', function(WorkspaceService, Canvas) {

    return {
        scope: true,
        restrict: 'E',
        link: function($scope, element, attrs) {
            function updateScope() {
                $scope.Utils.updateScope($scope);
            }

            var index = parseInt(attrs.index, 10);
            var canvasEl = element.children('canvas').attr({
                width: $scope.workspaceWidth,
                height: $scope.workspaceHeight
            });
            element.append(canvasEl);

            var canvas = WorkspaceService.canvases[index];
            canvas.canvas = new Canvas({
                el: canvasEl[0],
                data: canvas.data
            });

            canvas.canvas.getInstance()
                .on('text:changed', updateScope)
                .on('object:selected', updateScope)
                .on('object:modified', updateScope)
                .on('selection:cleared', updateScope);
        }
    };

});