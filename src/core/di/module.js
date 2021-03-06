/* global module: true */

"use strict";

function module(dependentModules) {
    if (!isArray(dependentModules)) {
        dependentModules = dependentModules ? [dependentModules] : [];
    }

    var services = {};
    var decorators = {};
    var exportNames = [];

    function updateDependencyNames(name, dependencies) {
        forEach(dependencies, function(dependency, index) {
            if (0 === dependency.indexOf("$config")){
                dependencies[index] = "config." + name;
            }
        });
    }

    function privateNames() {
        var allNames = [];
        forEach(services, function(service, name) {
            allNames.push(name);
        });

        // Sanity check to ensure all export names map to a service
        // (exports can't include dependent module services)
        forEach(exportNames, function(exportName) {
            if (-1 === allNames.indexOf(exportName)) {
                assert(false, "export name {0} doesn't map to a service", exportName);
            }
        });

        return allNames.filter(function(name) {
            var isConfigForExported = false;
            if (0 === name.indexOf("config.")) {
                var serviceName = name.slice("config.".length);
                isConfigForExported = 0 <= exportNames.indexOf(serviceName);
            }

            return !isConfigForExported && 0 > exportNames.indexOf(name);
        });
    }

    function updateNameForExport(oldName, exportedServices, exportedDecorators) {
        var newName = generateUUID();

        var service = exportedServices[oldName];
        if (service) {
            delete exportedServices[oldName];
            exportedServices[newName] = service;
        }

        var decorator = exportedDecorators[oldName];
        if (decorator) {
            delete exportedDecorators[oldName];
            exportedDecorators[newName] = decorator;
        }

        forEach(exportedServices, function(service, key) {
            var cloned = updateDependencies(service);
            if (cloned) {
                exportedServices[key] = cloned;
            }
        });

        forEach(exportedDecorators, function(decorator, key) {
            var cloned = updateDependencies(decorator);
            if (cloned) {
                exportedDecorators[key] = cloned;
            }
        });

        function updateDependencies(item) {
            var cloned = null;

            // Clone the service/decorator in this case since the new private name
            // is tied to the export. We don't want the dependencies altered for
            // further exports
            forEach(item.dependencies, function(dependency, index) {
                if (dependency == oldName) {
                    cloned = {};
                    cloned.dependencies = clone(item.dependencies);
                    cloned.name = item.name;
                    cloned.value = item.value;
                    cloned.type = item.type;

                    cloned.dependencies[index] = newName;

                    return false;
                }
            });

            return cloned;
        }
    }

    function addConfigServicesToExports(names) {
        var updated = [];
        forEach(names, function(name) {
            updated.push(name);

            if (0 !== name.indexOf("config.")) {
                updated.push("config." + name);
            }
        });

        return updated;
    }

    return {
        exports: function(names) {
            exportNames = names;
        },

        factory: function(name, dependencies, factory) {
            assert(name, "service requires a name");
            assert(isFunction(factory), "factory services requires a function provider");

            updateDependencyNames(name, dependencies);

            services[name] = {dependencies: dependencies, value: factory};
            return this;
        },

        type: function(name, dependencies, Type) {
            // guess it to be a function constructor... why "new" sucks!
            assert(isFunction(Type), "factory services requires a function constructor");

            return this.factory(name, dependencies, function() {
                var instance = Object.create(Type.prototype);
                instance = Type.apply(instance, argumentsToArray(arguments)) || instance;

                return instance;
            });
        },

        typeFactory: function(name, dependencies, Type) {
            // guess it to be a function constructor...
            assert(isFunction(Type), "factory services requires a function constructor");

            return this.factory(name, dependencies, function() {
                var factoryArgs = argumentsToArray(arguments);
                return function() {
                    var instance = Object.create(Type.prototype);
                    instance = Type.apply(instance, factoryArgs.concat(argumentsToArray(arguments))) || instance;

                    return instance;
                };
            });
        },

        value: function(name, value) {
            return this.factory(name, null, function() {
                return value;
            });
        },

        decorator: function(name, dependencies, decorator) {
            assert(name,  "decorator service requires a name");
            assert(isFunction(decorator), "decorator service requires a function provider");

            updateDependencyNames(name, dependencies);

            decorators[name] = {dependencies: dependencies, value: decorator};
            return this;
        },

        config: function(name, config) {
            assert(name, "config service requires a name");

            return this.value("config." + name , config);
        },

        exported: function() {
            var exportedServices = extend({}, services);
            var exportedDecorators = extend({}, decorators);

            // Create pseudo private services, they are still public; however,
            // there is no reasonable way to access these services outside of the module
            if (!isEmpty(exportNames)) {
                var names = privateNames();

                forEach(names, function(name) {
                    updateNameForExport(name, exportedServices, exportedDecorators);
                });
            }

            return {
                services: exportedServices,
                decorators: exportedDecorators
            };
        },

        getDependentModules: function() {
            return dependentModules;
        }
    };
}