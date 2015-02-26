/*global window: false */

/**
 * @rdoc service
 * @name $async
 * @module core
 * @example async-demo.js this is example 1 this is example 1 this is example 1 this is example 1 this is example 1 v this is example 1 321321312
 * @example async-demo-2.js this is example 2
 * @require something
 * @require something2
 * @description
 * this is the description for $async!!
 ```
    function test() {
    };
 ```
 * [inline link](www.google.com)
 * @require something 3
 */

"use strict";

function addAsyncService(module) {
    module.factory("$async", null, function() {
        var $async = function(fn, timeMs) {
            return window.setTimeout(function() {
                fn();
            }, timeMs);
        };

        return extend($async, {
            /**
             * @rdoc method
             * @module core
             * @service $async
             * @name cancel
             *
             * @param {String} id this is a value :)
             * @param {Object} test not here!
             * @return {String} some value [inline link](www.google.com) @{core.$promise#all promise something}
             * @throws {Error} nothing!
             * @private
             * @description test
             *
             * description
             */
            cancel: function(id) {
                window.clearTimeout(id);
            }

            /**
             * @rdoc config
             * @module core
             * @service $async
             * @name something
             *
             * @description blah
             * @type {String}
             */

            /**
             * @rdoc property
             * @service $async
             * @name something
             *
             * @description wee
             * @type {String}
             */
        });
    });
}