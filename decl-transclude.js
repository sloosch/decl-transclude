(function (angular) {
    var declModule = angular.module('declTransclude', []);

    var declSnakeCase = function (camelCase) {
        return camelCase.replace(/([a-z][A-Z])/g, function (g) {
            return g[0] + '-' + g[1].toLowerCase();
        });
    };

    declModule.value('declTranscludePriority', Infinity);
    declModule.constant('DECL_OR_DEFAULT_IF', 'orDefaultIf');
    declModule.constant('DECL_TRANSCLUDE_AS', 'declTranscludeAs');

    declModule.provider('declRegistry', function () {
        var registry = [];

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
            register: function (elementName, registryNameFn) {
                if(!angular.isArray(elementName)) {
                    elementName = [elementName];
                }
                angular.forEach(elementName, function (name) {
                    registry.push({name: declSnakeCase(name), registryName: registryNameFn || angular.noop});
                });
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

    declModule.config(function (declRegistryProvider, DECL_TRANSCLUDE_AS) {
        declRegistryProvider.register(DECL_TRANSCLUDE_AS, function (element) {
            return element.attributes[declSnakeCase(DECL_TRANSCLUDE_AS)].value;
        });
    });

    declModule.controller('declTranscludeController', function ($compile, $q, DECL_OR_DEFAULT_IF) {
        var self = this;
        var templates = {};
        var orDefaultIfSnakeCase = declSnakeCase(DECL_OR_DEFAULT_IF);

        self.putTemplate = function (name, contents) {
            templates[name] = contents;
        };

        self.transcludeAndAppend = function(name, locals, futureParent) {
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

                var element = angular.element(templateDef.contents);

                var rawElement = element[0];
                if(rawElement.attributes[orDefaultIfSnakeCase] && scope.$eval(rawElement.attributes[orDefaultIfSnakeCase].value)) {
                    deferred.reject(name + ' wants default.');
                } else {
                    //by appending it here we ensure that the element does inherit the data e.g. parent controllers
                    //so element can require other parent directives
                    futureParent.append(element);
                    $compile(element)(scope);
                    deferred.resolve(element);
                }
            }
            return deferred.promise;
        };
    });

    var declTranscludeDirective = ['declTranscludePriority', 'declRegistry', function (declTranscludePriority, declRegistry) {
        return {
            priority: declTranscludePriority,
            controller: 'declTranscludeController',
            compile: function (tElement) {
                var temps = {};
                angular.forEach(tElement.children(), function (child) {
                    var register = declRegistry.entryForElement(child);
                    if (register) {
                        temps[declRegistry.registryName(register, child)] = child.outerHTML;
                        child.parentNode.removeChild(child);
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
    }];

    /**
     * @deprecated
     */
    declModule.directive('declTransclude', declTranscludeDirective);

    /**
     * @since 0.1.5
     */
    declModule.directive('withSetup', declTranscludeDirective);

    declModule.directive('declTranscludeFrom', function () {
        return {
            require: ['?^declTransclude', '?^withSetup'],
            transclude: true,
            link: function (scope, element, attrs, ctrls, transclude) {
                var declTransclude = ctrls[0] || ctrls[1];
                var appendToElement = function (clone) {
                  element.append(clone);
                };

                var transcludeDefault = function () {
                    transclude(appendToElement);
                };

                var getLocals = function () {
                    if (attrs.transcludeLocals) {
                        return scope.$eval(attrs.transcludeLocals);
                    }
                };

                if(!declTransclude) {
                    transcludeDefault();
                } else {
                    declTransclude
                        .transcludeAndAppend(attrs.declTranscludeFrom, getLocals(), element)
                        .catch(transcludeDefault);
                }
            }
        };
    });

})(angular);