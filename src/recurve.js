"use strict";

var Module = require("./di/module.js");
var ObjectUtils = require("./utils/object.js");
var Proto = require("./utils/proto.js");
var assert = require("./utils/assert.js");

var modules = [];

var recurve = window.recurve = {
    module: function(name, dependencyNames) {
        var dependencies = [];
        var coreAdded = false;

        ObjectUtils.forEach(dependencyNames, function(name) {
            var knownModule = modules[name];
            assert(knownModule, "module {0} does not exist", name);

            if (name === "rc") {
                coreAdded = true;
            }

            dependencies.push(knownModule);
        });

        if (!coreAdded) {
            dependencies.unshift(coreModule);
        }

        var module = new Module(name, dependencies);
        modules.push(module);

        return module;
    },

    define: Proto.define,
    mixin: Proto.mixin,
    mixinWith: Proto.mixinWith,

    forEach: ObjectUtils.forEach,
    areEqual: ObjectUtils.areEqual,
    isNaN: ObjectUtils.isNaN,
    isSameType: ObjectUtils.isSameType,
    isString: ObjectUtils.isString,
    isError: ObjectUtils.isError,
    isObject: ObjectUtils.isObject,
    isArray: ObjectUtils.isArray,
    isFunction: ObjectUtils.isFunction,
    isDate: ObjectUtils.isDate,
    isNumber: ObjectUtils.isNumber,
    toJson: ObjectUtils.toJson,
    fromJson: ObjectUtils.fromJson,

    assert: assert
};

var coreModule = recurve.module("rc");

// TODO TBD register services
require("./core/cookies.js")(coreModule);
require("./core/signal.js")(coreModule);
require("./core/event-emitter.js")(coreModule);
require("./core/cache.js")(coreModule);
require("./core/cache-factory.js")(coreModule);