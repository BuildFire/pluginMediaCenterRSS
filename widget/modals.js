(function (angular, buildfire) {
    'use strict';
    if (!buildfire) {
        throw ("buildfire not found");
    }
    angular
        .module('media_RSSModals', ['ui.bootstrap'])
        .factory('Modals', ['$modal', function ($modal) {
            return {
                removeTrackModal: function () {
                    $modal
                        .open({
                            templateUrl: 'templates/modals/remove-track-modal.html',
                            controller: 'RemoveTrackModalPopupCtrl',
                            controllerAs: 'RemoveTrackPopup',
                            size: 'sm'
                        });
                }
            };
        }])
        .controller('RemoveTrackModalPopupCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
            console.log('RemoveTrackModalPopupCtrl Controller called-----');
            var RemoveTrackPopup = this;
            RemoveTrackPopup.ok = function () {
                $modalInstance.close();
            };
        }]);
})(window.angular, window.buildfire);
