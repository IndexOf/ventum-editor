/**
 * Created by kemal on 06.04.15.
 */
angular.module('editor').directive('fileReader', function($parse) {
    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
            var onHandler = $parse(attrs.fileReader);
            var input = element.on('change', function() {
                var file = input.get(0).files[0];
                var reader = new FileReader();

                reader.onload = function() {
                    onHandler($scope, {url: reader.result, file: file});
                    input.val('');
                };

                if (file) {
                    reader.readAsDataURL(file);
                }
            });

        }
    };
});