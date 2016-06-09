/**
 * Сервис рабочей области редактора
 */
angular.module('editor').service('WorkspaceService', function($http, config) {
    /**
     * @type {Array}
     */
    this.canvases = [];

    /**
     * @returns {Array}
     */
    this.getFontSizes = function() {
        var sizes = [];
        var fontSize = config.font.size;

        for (var i = fontSize[0]; i <= fontSize[1]; i++) {
            sizes.push(i);
        }

        return sizes;
    };

    /**
     * Loads data of canvas
     * @returns {$q.defer}
     */
    this.loadCanvases = function() {
        var self = this;

        return $http.get('server/canvases.json')
            .success(function(response) {
                self.canvases = response.result;
            });
    };
});