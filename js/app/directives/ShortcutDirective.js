angular.module('editor').directive('shortcut', [
    '$document',
    function($document) {
        return {
            restrict: 'A',
            link: function($scope) {
                $document.on('keydown', function(e) {
                    if (['input', 'textarea'].indexOf(e.target.tagName.toLowerCase()) !== -1) {
                        return;
                    }

                    switch (e.which) {
                        // Escape
                        case 27:
                            $scope.discardSelected();
                            break;
                        // Delete
                        case 46:
                            $scope.removeSelected();
                            break;
                        default:
                    }
                });
            }
        };
    }
]);