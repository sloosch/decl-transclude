(function (angular) {
    var appModule = angular.module('app', [
        'declTransclude'
    ]);

    appModule.config(function (declRegistryProvider) {
        declRegistryProvider
            .register([
                'myFormTitle',
                'myFormInfo',
                'myFormButtonTitle',
                'myFormCancelTitle',
                'myFormHelpText',
                'anInput'
            ]);
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

        $scope.someStaticCondition = function () {
          return true;
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

    //demo for require ^form
    appModule.directive('myDecorativeInputWrapper', function () {
        return {
            scope: {},
            template: '<label>decoration! <div decl-transclude-from="anInput"></div></label>'
        }
    });

})(angular);