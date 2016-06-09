angular.module('common').directive('uploadImage', function($http, $modal, $parse) {
    return {
        restrict: 'A',

        link: function ($scope, element, attrs) {
            var onHandler = $parse(attrs.uploadImage);
            var getCropOptions = $parse(attrs.uploadImageCropOptions);

            element.on('click', function() {
                var modalInstance = $modal.open({
                    controller: UploadImageCtrl,
                    resolve: {
                        cropOptions: function() {
                            return getCropOptions($scope);
                        }
                    },
                    templateUrl: 'js/app/common/upload-image/view.html?' + Math.round(Math.random() * 1000000),
                    size: 'lg',
                    windowClass: 'modal-upload'
                });

                modalInstance.result.then(function(response) {
                    onHandler($scope, {url: response.url, type: response.type});
                });
            });
        }
    };
});

angular.module('common').directive('uploadImagePreview', function() {

    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
            $scope.$on('preview:change', function() {
                element.on('load', function() {
                    var image = element.get(0);
                    var width = image.naturalWidth;
                    var height = image.naturalHeight;
                    var selection = {
                        x1: width * 0.1,
                        y1: height * 0.1,
                        x2: width * 0.9,
                        y2: height * 0.9
                    };

                    if ($scope.cropOptions && _.isString($scope.cropOptions.aspectRatio)) {
                        var ratio = $scope.cropOptions.aspectRatio.split(':');
                        var maxW = selection.x2 - selection.x1;
                        var maxH = selection.y2 - selection.y1;

                        while (maxW * ratio[1] / ratio[0] > maxH) {
                            maxW--;
                        }

                        selection.y2 = selection.y1 + maxW * ratio[1] / ratio[0];
                    }

                    $scope.cropper = element.imgAreaSelect(angular.extend({
                        imageWidth: width,
                        imageHeight: height,
                        instance: true,
                        handles: true,
                        onSelectEnd: function(image, selection) {
                            $scope.selection = selection;
                        }
                    }, selection, $scope.cropOptions));
                    $scope.$apply();
                });

                element.css('maxHeight', angular.element(window).height() - 150);
            });

            $scope.$on('preview:close', function() {
                $scope.croppedUrl = $scope.Utils.cropImage(element.get(0), $scope.cropper.getSelection());
            });
        }
    };
});