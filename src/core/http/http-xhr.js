"use strict";

function addHttpXhrService(module) {
    module.factory("$httpXhr", ["$window", "$promise"], function($window, $promise) {
        return function (options) {
            var xhr;
            var canceled = false;
            var deferred;

            function config() {
                addHeaders();

                if (options.withCredentials) {
                    xhr.withCredentials = true;
                }

                if (options.hasOwnProperty("timeout")) {
                    xhr.timeout = options.timeout;
                }

                if (options.responseType) {
                    try {
                        xhr.responseType = options.responseType;
                    }
                    catch (error) {
                        // https://bugs.webkit.org/show_bug.cgi?id=73648
                        // Safari will throw error for "json" method, ignore this since
                        // we can handle it
                        if (!isEqualIgnoreCase("json", options.method)) {
                            throw error;
                        }
                    }
                }
            }

            function addHeaders() {
                forEach(options.headers, function(value, header) {
                    if (value) {
                        xhr.setRequestHeader(header, value);
                    }
                });
            }

            function stateChangeHandler() {
                if (4 !== xhr.readyState) {
                    return;
                }

                var status = 0;
                var statusText = "";
                var responseHeaders = null;
                var data = null;

                // accessing any properties on the xhr object for aborted/canceled request will throw error on IE
                // http://stackoverflow.com/questions/7287706/ie-9-javascript-error-c00c023f/7288000#7288000
                if (!canceled) {
                    data = getData();
                    status = getStatus(data);
                    statusText = xhr.statusText;
                    responseHeaders = xhr.getAllResponseHeaders();
                }

                var response = {
                    data: data,
                    status : status,
                    statusText : statusText,
                    headers : parseResponseHeaders(responseHeaders),
                    options : options,
                    canceled : canceled
                };

                if (successful(status)) {
                    deferred.resolve(response);
                }
                else {
                    deferred.reject(response);
                }
            }

            function parseResponseHeaders(str) {
                var headers = {};
                if (!str) {
                    return headers;
                }

                var split = str.split("\n");

                forEach(split, function(keyValue) {
                    var index = keyValue.indexOf(":");
                    if (0 < index) {
                        var key = keyValue.substring(0, index).toLowerCase();
                        var value = keyValue.substring(index + 1);
                        value = value ? value.trim() : "";

                        headers[key] = value;
                    }
                });

                return headers;
            }

            function getStatus(data) {
                var status = xhr.status;

                // fix 0 status code when accessing files
                if (0 === status) {
                    if (data) {
                        status = 200;
                    }
                    else if ("file:" === $window.location.protocol) {
                        status = 404;
                    }
                    else {
                        // do nothing - keep as is
                    }
                }

                // IE9 and below bug with returning 1223 status
                status = 1223 === status ? 204 : status;

                return status;
            }

            function successful(status) {
                return 200 <= status && 300 > status;
            }

            function getData() {
                var accept =  options.headers && options.headers.Accept;
                if (!accept) {
                    accept = xhr.getResponseHeader('content-type');
                }

                var data;
                var ignoreCase = true;

                if (contains(accept, "application/xml", ignoreCase) ||
                    contains(accept, "text/xml", ignoreCase)) {
                    data = xhr.responseXML;
                }
                else {
                    data = xhr.responseText;
                }

                return data;
            }

            return {
                send: function() {
                    if ($window.XMLHttpRequest) {
                        xhr = new $window.XMLHttpRequest();
                    }
                    else {
                        assert(false, "recurve only supports IE8+");
                    }

                    xhr.onreadystatechange = stateChangeHandler;
                    xhr.open(options.method.toUpperCase(), options.url, true);

                    config();
                    xhr.send(options.data);

                    deferred = $promise.defer();
                    return deferred.promise;
                },

                cancel: function() {
                    canceled = true;

                    if (xhr) {
                        xhr.abort();
                    }
                }
            };
        };
    });
}