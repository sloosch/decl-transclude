(function (angular) {
    var declModule = angular.module('declTransclude', []);

    declModule.value('declTranscludePriority', Infinity);

    declModule.controller('declTranscludeController', function ($compile) {
        var self = this;
        var templates = {};
        self.putTemplate = function (name, contents) {
            templates[name] = contents;
        };

        self.transclude = function(name, cloneFn, locals) {
            var templateDef = templates[name];
            var scope = templateDef.scope;
            if(angular.isDefined(locals)) {
                scope = scope.$new();
                angular.extend(scope, locals);
            }
            $compile(templateDef.contents)(scope, cloneFn);
        }
    });

    declModule.directive('declTransclude', function (declTranscludePriority) {
        var TRANSCLUDE_AS = 'decl-transclude-as';
        return {
            priority: declTranscludePriority,
            controller: 'declTranscludeController',
            compile: function (tElement) {
                var temps = {};
                angular.forEach(tElement.children(), function (child) {
                   if(angular.isDefined(child.attributes[TRANSCLUDE_AS])) {
                       temps[child.attributes[TRANSCLUDE_AS].value] = child;
                       child.remove();
                   }
                });
                return {
                    pre: function (scope, element, attrs, ctrl) {
                        angular.forEach(temps, function (contents, name) {
                            ctrl.putTemplate(name, {contents: contents, scope: scope});
                        });
                    }
                };
            }
        };
    });

    declModule.directive('declTranscludeFrom', function () {
        return {
            require: '?^declTransclude',
            link: function (scope, element, attrs, declTransclude) {
                if(!declTransclude) return;
                var getLocals = function () {
                    if(attrs.transcludeLocals) {
                        return scope.$eval(attrs.transcludeLocals);
                    }
                };
                declTransclude.transclude(attrs.declTranscludeFrom, function (clone) {
                    element.append(clone);
                }, getLocals());
            }
        }
    });

})(angular);