/**
 * Created by kemal 17.02.2015
 * Main an application module
 */
angular.module('editor', ['ngRoute', 'ui.bootstrap', 'common'])

    .config(function($locationProvider, $routeProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        $routeProvider

            .when('/', {
                templateUrl: 'views/editor.html',
                controller: 'EditorCtrl',
                controllerAs: 'editor',
                resolve: EditorCtrl.resolve
            })

            .otherwise({redirectTo: '/'});
    })

    .run(function($rootScope, Utils, config) {
        $rootScope.Utils = Utils;
        _.assign(fabric.Object.prototype, config.selectionStyle, {
            gaussianBlur: 0
        });
    })

    .controller('AppCtrl', function() {})

;