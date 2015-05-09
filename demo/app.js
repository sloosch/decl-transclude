(function (angular) {
    var appModule = angular.module('app', [
        'declTransclude'
    ]);

    appModule.controller('AppController', function($scope) {
        $scope.doIt = function() {
            alert('test');
        };
    });

    appModule.directive('someDirective', function () {
        return {
            transclude:true,
            scope: {},
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