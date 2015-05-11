(function (angular) {
    var declModule = angular.module('declTransclude', []);

    declModule.value('declTranscludePriority', Infinity);


    declModule.provider('declRegistry', function () {
        var registry = [];

        var snakeCase = function (str) {
            return str.replace(/([a-z][A-Z])/g, function (g) {
                return g[0] + '-' + g[1].toLowerCase();
            });
        };

        var entryForElement = function (element) {
            for(var i = 0; i < registry.length; i++) {
                var register = registry[i];
                if(element.tagName.toLowerCase() === register.name || angular.isDefined(element.attributes[register.name])) {
                    return register;
                }
            }
            return null;
        };

        var declRegistry = {
            register: function (directiveName, registryNameFn) {
                registry.push({name: snakeCase(directiveName), registryName: registryNameFn || angular.noop});
                return declRegistry;
            },
            $get: function () {
                return {
                    entryForElement: entryForElement,
                    registryName: function (register, element) {
                        return register.registryName(element) || register.name;
                    }
                };
            }
        };
        return declRegistry;
    });

    declModule.config(function (declRegistryProvider) {
        declRegistryProvider.register('declTranscludeAs', function (element) {
            return element.attributes['decl-transclude-as'].value;
        });
    });

    declModule.controller('declTranscludeController', function ($compile, $q) {
        var self = this;
        var templates = {};
        self.putTemplate = function (name, contents) {
            templates[name] = contents;
        };

        self.transclude = function(name, locals) {
            var deferred = $q.defer();
            var templateDef = templates[name];
            if(!templateDef) {
                deferred.reject(name + ' not found.');
            } else {
                var scope = templateDef.scope;
                if (angular.isDefined(locals)) {
                    scope = scope.$new();
                    angular.extend(scope, locals);
                }
                $compile(templateDef.contents)(scope, function (clone) {
                    deferred.resolve(clone);
                });
            }
            return deferred.promise;
        };
    });

    declModule.directive('declTransclude', function (declTranscludePriority, declRegistry) {
        return {
            priority: declTranscludePriority,
            controller: 'declTranscludeController',
            compile: function (tElement) {
                var temps = {};
                angular.forEach(tElement.children(), function (child) {
                    var register = declRegistry.entryForElement(child);
                    if(register) {
                        temps[declRegistry.registryName(register, child)] = child.outerHTML;
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
            transclude: true,
            link: function (scope, element, attrs, declTransclude, transclude) {
                if(!declTransclude) return;
                var getLocals = function () {
                    if(attrs.transcludeLocals) {
                        return scope.$eval(attrs.transcludeLocals);
                    }
                };
                declTransclude.transclude(attrs.declTranscludeFrom, getLocals()).then(function (clone) {
                    element.append(clone);
                }, function () {
                    transclude(function (clone) {
                        element.append(clone);
                    });
                });
            }
        };
    });

})(angular);