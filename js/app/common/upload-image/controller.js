/**
 * Created by kemal on 06.04.15.
 */
function UploadImageCtrl($scope, $modalInstance, cropOptions) {

    $scope.cropOptions = angular.fromJson(cropOptions);

    $scope.ok = function() {
        $scope.$broadcast('preview:close');
        $modalInstance.close({
            url: $scope.croppedUrl || $scope.previewUrl
        });
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.onLoad = function(url, file) {
        if (/image\/svg/.test(file.type)) {
            $modalInstance.close({
                url: url,
                type: 'svg'
            });
        } else {
            $scope.$apply(function($scope) {
                $scope.previewUrl = url;
            });

            $scope.$broadcast('preview:change', cropOptions);
        }
    };

    $scope.removeCropper = function() {
        if ($scope.cropper) {
            $scope.cropper.remove();
        }
    };

    $modalInstance.result.then(function() {
        $scope.removeCropper();
    }, function() {
        $scope.removeCropper();
    });

}
