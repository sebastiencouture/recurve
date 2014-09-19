"use strict";

var recurveFiles = {
    "recurveSrc": [
        "src/common.js",
        "src/recurve.js",
        "src/di/container.js",
        "src/di/module.js",
        "src/core/signal.js",
        "src/core/event-emitter.js",
        "src/core/window.js",
        "src/core/cache.js",
        "src/core/log/log.js",
        "src/core/log/log-console.js",
        "src/core/global-error-handler.js",
        "src/core/performance.js",
        "src/core/cookies.js",
        "src/core/storage.js"
    ],

    "recurveModules" : {
        "mock" : [
            "src/mock/mock-log.js",
            "src/mock/mock-cookies.js",
            "src/mock/mock.js"
        ]
    },

    "test": [
        "test/**/*.spec.js"
    ]
};

if (exports) {
    exports.files = recurveFiles;
}