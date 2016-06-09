/**
 * Created by kemal on 28.02.15
 */
function EditorCtrl($scope, WorkspaceService, config, Utils) {
    $scope.activeCanvasIndex = 0;
    $scope.canvases = WorkspaceService.canvases;
    $scope.font = {
        families: config.font.families,
        lastFillColor: config.font.defaultFillColor,
        sizes: WorkspaceService.getFontSizes()
    };

    /**
     * @param {string} url
     * @param {string} type
     */
    $scope.addImage = function(url, type) {
        var canvas = getActiveCanvas();
        canvas.addImage(url, type);
    };

    /**
     * Add text
     * @param {string} text
     */
    $scope.addText = function(text) {
        var canvas = getActiveCanvas();
        var textObject = canvas.addText(text, {
            fill: $scope.font.lastFillColor
        });
    };

    /**
     * @param {string} direction
     */
    $scope.alignGroup = function(direction) {
        getActiveCanvas().alignGroup(direction);
    };

    /**
     * Bring to front the selected object
     */
    $scope.bringToFront = function() {
        getActiveCanvas().bringToFront();
    };

    $scope.canUseUndo = function() {
        var activeCanvas = getActiveCanvas();
        return activeCanvas && activeCanvas.canUseUndo();
    };

    $scope.canUseRedo = function() {
        var activeCanvas = getActiveCanvas();
        return activeCanvas && activeCanvas.canUseRedo();
    };

    /**
     * Discard selected object or group
     */
    $scope.discardSelected = function() {
        getActiveCanvas().discardSelected();
    };

    /**
     * Returns the aspect ratio of canvas
     * @returns {object}
     */
    $scope.getBackroundImageCropOptions = function() {
        var canvas = getActiveCanvas().getInstance();

        return {
            aspectRatio: canvas.getWidth() + ':' + canvas.getHeight()
        };
    };

    /**
     * Get objects of canvas by type
     * If the type is undefined then returns all objects
     * @param {string} [type]
     */
    $scope.getObjects = function(type) {
        return getActiveCanvas().getInstance().getObjects(type);
    };

    /**
     * @param {string} name
     * @returns {Array}
     */
    $scope.getProp = function(name) {
        var canvas = getActiveCanvas();
        return canvas && canvas.getProp(name) || [];
    };

    /**
     * @returns {boolean}
     */
    $scope.hasActiveGroup = function() {
        var canvas = getActiveCanvas();
        return !! (canvas && canvas.getInstance().getActiveGroup());
    };

    /**
     * Get selected object or group
     * @param {string|array} [type]
     * @returns {*}
     */
    $scope.hasSelected = function(type) {
        var canvas = getActiveCanvas();
        return canvas && canvas.hasSelected(type);
    };

    $scope.isSelected = function(object) {
        return getActiveCanvas().isSelected(object);
    };

    /**
     * Check exist value of property for the objects
     * @param {string} name
     * @param {*} value
     * @returns {boolean}
     */
    $scope.isProp = function(name, value) {
        return getActiveCanvas().isProp(name, value);
    };

    /**
     * Redo changes in active canvas
     */
    $scope.redo = function() {
        getActiveCanvas().redo();
    };

    /**
     * Remove object
     * @param {object} object
     */
    $scope.removeObject = function(object) {
        getActiveCanvas().removeObject(object);
    };

    /**
     * Remove selected object or group
     */
    $scope.removeSelected = function() {
        getActiveCanvas().removeSelected();
        $scope.Utils.updateScope($scope);
    };

    /**
     * Send to back the selected object
     */
    $scope.sendToBack = function() {
        getActiveCanvas().sendToBack();
    };

    /**
     * Set background color
     * @param {string} color
     */
    $scope.setBackgroundColor = function(color) {
        getActiveCanvas().setBackgroundColor(color);
        $scope.Utils.updateScope($scope);
    };

    $scope.setBackgroundImage = function(url) {
        getActiveCanvas().setBackgroundImage(url).then(function() {
            $scope.Utils.updateScope($scope);
        });
    };

    $scope.setFillColor = function(color) {
        $scope.font.lastFillColor = color;
        $scope.setProp('fill', color);
    };

    /**
     * Set the passed object as an active
     * @param {object} object
     */
    $scope.setSelected = function(object) {
        getActiveCanvas().setSelected(object);
    };

    /**
     * Set the value of the selected object property
     * @param {string} name
     * @param {*} value
     */
    $scope.setProp = function(name, value) {
        getActiveCanvas().setProp(name, value);
    };

    /**
     * Toggle the property of objects
     * @param {string} name
     * @param {*} value
     */
    $scope.toggleProp = function(name, value) {
        getActiveCanvas().toggleProp(name, value);
        $scope.Utils.updateScope($scope);
    };

    $scope.toSVG = function() {
        $scope.outputSVG = getActiveCanvas().getInstance().toSVG();
    };

    /**
     * Undo changes in selected Canvas
     */
    $scope.undo = function() {
        getActiveCanvas().undo();
    };

    /**
     * Returns an active canvas instance
     * @returns {fabric.Canvas}
     */
    function getActiveCanvas() {
        return $scope.canvases[$scope.activeCanvasIndex].canvas;
    }
}

EditorCtrl.resolve = {
    loadCanvases: function(WorkspaceService) {
        return WorkspaceService.loadCanvases();
    }
};

angular.module('editor').controller('EditorCtrl', EditorCtrl);