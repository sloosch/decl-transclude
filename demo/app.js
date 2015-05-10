(function (angular) {
    var appModule = angular.module('app', [
        'declTransclude'
    ]);

    appModule.config(function (declRegistryProvider) {
        declRegistryProvider
            .register('myFormTitle')
            .register('myFormInfo')
            .register('myFormButtonTitle')
            .register('myFormCancelTitle');
    });

    appModule.directive('myForm', function () {
        return {
            scope: {},
            templateUrl: 'views/my-form.html'
        };
    });

    appModule.controller('AppController', function($scope) {
        $scope.doIt = function() {
            alert('test');
        };
    });

    appModule.directive('someDirective', function () {
        return {
            transclude:true,
            scope: true,
            templateUrl: 'views/decldir.html',
            controller: function ($scope) {
                $scope.something = [
                    {id: 1, name: 'a'},
                    {id: 2, name: 'b'},
                    {id: 3, name: 'c'},
                    {id: 4, name: 'd'}
                ];

                $scope.remove = function(some) {
                    var idx = $scope.something.indexOf(some);
                    $scope.something.splice(idx, 1);
                }
            }
        };
    });

})(angular);