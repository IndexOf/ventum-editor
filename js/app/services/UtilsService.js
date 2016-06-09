/**
 * Global helper functions
 */
angular.module('editor').service('Utils', function() {
    /**
     * @param {string} string
     * @returns {string}
     */
    this.capitalize = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    /**
     * HTML5 Canvas Image Crop
     * @param {HTMLElement} image
     * @param {object} selection
     * @returns {string}
     */
    this.cropImage = function(image, selection) {
        var temp_canvas = document.createElement('canvas');
        var temp_ctx = temp_canvas.getContext('2d');

        temp_canvas.width = selection.width;
        temp_canvas.height = selection.height;
        temp_ctx.drawImage(image, selection.x1, selection.y1, selection.width, selection.height, 0, 0, selection.width, selection.height);

        return temp_canvas.toDataURL();
    };

    /**
     * Move caret position to end
     * @param {HTMLInputElement} el
     */
    this.moveCaretToEnd = function(el) {
        var elemValLength = el.value.length;
        el.setSelectionRange(elemValLength, elemValLength);
    };

    /**
     * Generate a random color
     * @returns {string}
     */
    this.randomColor = function() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    /**
     * Correctly update the scope
     * @param {object} $scope
     */
    this.updateScope = function($scope) {
        if (!$scope.$$phase) $scope.$apply();
    };
});