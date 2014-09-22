"use strict";

describe("$promise", function() {
    var $promise;

    beforeEach(function() {
        $invoke(["$promise"], function(promise) {
            $promise = promise;
        });
    });

    it("should be invokable", function() {
        expect($promise).toBeDefined();
        expect(isFunction($promise)).toEqual(true);
    });

    describe("factory", function() {
        it("should fulfill if resolved with value", function(done) {
            var promise = $promise(function(resolve) {
                resolve(1);
            });

            promise.then(function(value) {
                expect(value).toEqual(1);
                done();
            });
        });

        it("should reject if rejected with reason", function(done) {
            var promise = $promise(function(resolve, reject) {
                reject(1);
            });

            promise.then(function() {
                assert(false);
                done();
            }, function(reason) {
                expect(reason).toEqual(1);
                done();
            })
        });

        it("should reject on error with the error as the reason", function() {
            var promise = $promise(function() {
                throw new Error("a");
            });

            promise.then(function() {
                assert(false);
                done();
            }, function(reason) {
                expect(reason).toEqual(new Error("a"));
                done();
            })
        });

        it("should resolve only once", function(done) {
            var resolver;
            var rejector;

            var thenable = {
                then: function(resolve, reject) {
                    resolver = resolve;
                    rejector = reject;
                }
            };

            var promise = $promise(function(resolve) {
                resolve(1);
            });

            var resolveCount = 0;
            var rejectCount = 0;

            promise.then(function() {
                return thenable;
            }).then(function() {
                resolveCount++;
            }, function() {
                rejectCount++;
            });

            setTimeout(function() {
                resolver(1);
                rejector(1);
                resolver(1);
                rejector(1);

                setTimeout(function() {
                    expect(resolveCount).toEqual(1);
                    expect(rejectCount).toEqual(0);
                    done();

                }, 50);
            }, 50);
        });

        it("should resolve with first fulfilled value", function(done) {
            var fulfilledPromise = $promise(function(resolve) {
                resolve(1);
            });

            var promise = $promise(function(resolve) {
                resolve(fulfilledPromise);
            });

            promise.then(function(value) {
                expect(value).toEqual(1);
                done();
            }, function() {
                assert(false);
                done();
            });
        });

        it("should resolve with first fulfilled value for thenable", function(done) {
            var fulfilledThenable = {
                then: function(onFulfilled) {
                    setTimeout(function() {
                        onFulfilled(1);
                    }, 0);
                }
            };

            var promise = $promise(function(resolve) {
                resolve(fulfilledThenable);
            });

            promise.then(function(value) {
                expect(value).toEqual(1);
                done();
            }, function() {
                assert(false);
                done();
            });
        });

        it("should reject with first rejected reason", function(done) {
            var fulfilledPromise = $promise(function(resolve, reject) {
                reject(1);
            });

            var promise = $promise(function(resolve) {
                resolve(fulfilledPromise);
            });

            promise.then(function() {
                assert(false);
                done();
            }, function(reason) {
                expect(reason).toEqual(1);
                done();
            });
        });

        it("should reject with first rejected reason for thenable", function(done) {
            var fulfilledThenable = {
                then: function(onFulfilled, onRejected) {
                    setTimeout(function() {
                        onRejected(1);
                    }, 0);
                }
            };

            var promise = $promise(function(resolve) {
                resolve(fulfilledThenable);
            });

            promise.then(function() {
                assert(false);
                done();
            }, function(reason) {
                expect(reason).toEqual(1);
                done();
            });
        });

        it("should throw error if resolver is undefined", function() {
            expect(function() {
                $promise();
            }).toThrow();
        });

        it("should throw error if resolver is null", function() {
            expect(function() {
                $promise(null);
            }).toThrow();
        });

        it("should throw error if resolver is number", function() {
            expect(function() {
                $promise(1);
            }).toThrow();
        });

        it("should throw error if resolver is object", function() {
            expect(function() {
                $promise({});
            }).toThrow();
        });
    });

    // Promises/A+ spec: https://github.com/promises-aplus/promises-spec#notes
    describe("then", function() {
        describe("both onFulfilled and onRejected are optional arguments", function() {
            it("if onFulfilled is not a function, it must be ignored", function() {

            });

            it("if onRejected is not a function, it must be ignored", function() {

            });
        });



        describe("if onFulfilled is a function", function() {
            it("it must be called after promise is fulfilled, with promise's value as its first argument", function() {

            });

            it("it must not be called before promise is fulfilled", function() {

            });

            it("it must not be called more than once", function() {

            });
        });

        describe("if onRejected is a function", function() {
            it("it must be called after promise is rejected, with promise's reason as its first argument", function() {

            });

            it("it must not be called before promise is rejected", function() {

            });

            it("it must not be called more than once", function() {

            });
        });

        describe("onFulfilled or onRejected must not be called until the execution context stack contains only platform code", function() {
            it("should call onFulfilled async", function() {

            });

            it("should call onRejected async", function() {

            });
        });

        // onFulfilled and onRejected must be called as functions (i.e. with no this value)

        describe("then may be called multiple times on the same promise", function() {
            it("if/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then", function() {

            });

            it("if/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then", function() {

            });
        });

        describe("then must return a promise", function() {
            it("should return a promise", function() {

            });

            // If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x)
            // covered in "resolve" spec

            it("if either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason", function() {

            });

            it("if onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1", function() {

            });

            it("if onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason as promise1", function() {

            });
        });
    });

    describe("catch", function() {
        it("should be called on reject", function() {

        });
    });

    // Promises/A+ spec: https://github.com/promises-aplus/promises-spec#notes
    // Tests based on:
    // - https://github.com/promises-aplus/promises-tests/tree/master/lib/tests
    // - https://github.com/jakearchibald/es6-promise/blob/master/test/tests/extension-test.js
    describe("resolve", function() {
        describe("if x is a promise, adopt its state", function() {
            it("if x is pending, promise must remain pending until x is fulfilled or rejected.", function(done) {
                var deferred = $promise.defer();
                var promise = $promise.resolve(deferred.promise);

                promise.then(function(value) {
                    expect(value).toEqual(1);
                    done();
                }, function() {
                    assert(false);
                    done();
                });

                setTimeout(function() {
                    deferred.resolve(1);
                }, 10);
            });

            it("if/when x is fulfilled, fulfill promise with the same value", function(done) {
                var deferred = $promise.defer();
                var promise = $promise.resolve(deferred.promise);

                promise.then(function(value) {
                    expect(value).toEqual(1);
                    done();
                }, function() {
                    assert(false);
                    done();
                });

                setTimeout(function() {
                    deferred.resolve(1);
                }, 10);
            });

            it("if/when x is rejected, reject promise with the same reason", function(done) {
                var deferred = $promise.defer();
                var promise = $promise.resolve(deferred.promise);

                promise.then(function() {
                    assert(false);
                    done();
                }, function(reason) {
                    expect(reason).toEqual(1);
                    done();
                });

                setTimeout(function() {
                    deferred.reject(1);
                }, 10);
            });
        });

        describe("otherwise, if x is an object or function", function() {
            it("Let then be x.then", function() {
                if (!isFunction(Object.defineProperty)) {
                    return;
                }

                var thenable = {};
                var count = 0;

                Object.defineProperty(thenable, 'then', {
                    get: function() {
                        count++;
                        return function() {
                        };
                    }
                });

                expect(count).toEqual(0);
                $promise.resolve(thenable);
                expect(count).toEqual(1);
            });

            it("if retrieving the property x.then results in a thrown exception e, reject promise with e as the reason", function() {
                // TODO TBD don't think there is anyway to test this?
            });

            describe("if then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where", function() {
                it("if/when resolvePromise is called with a value y, run [[Resolve]](promise, y)", function() {

                });

                it("if/when rejectPromise is called with a reason r, reject promise with r", function() {

                });

                it("if both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.", function() {

                });

                describe("if calling then throws an exception e,", function() {
                    it("if resolvePromise or rejectPromise have been called, ignore it", function() {

                    });

                    it("otherwise, reject promise with e as the reason.", function() {

                    });
                });
            });

            it("if then is not a function, fulfill promise with x", function() {

            });
        });

        it("if x is not an object or function, fulfill promise with x", function() {

        });
    });

    describe("reject", function () {
        it("should reject with reason", function() {

        });
    });

    describe("defer", function() {
        it("should include a promise property", function() {

        });

        it("should resolve promise upon calling resolve property", function() {

        });

        it("should reject the promise upon calling reject property", function() {

        });
    });

    describe("all", function() {
        it("should fulfill after all promises are fulfilled", function(done) {
            done();
        });

        it("should reject after one promise is rejected", function(done) {
            done();
        });

        it("should return in order array of all fulfilled values", function(done) {
            done();
        });

        it("should allow non promise like values", function(done) {
            done();
        });

        it("should allow thenables", function(done) {
            done();
        });

        it("should reject if not array parameter", function(done) {
            $promise.all({}).then(function() {
                expect(false);
                done();
            }, function(reason) {
                expect(reason).toEqual(new TypeError("must pass an array to all"));
                done();
            });
        });
    });

    describe("race", function() {
        it("should fulfill after one promise is fulfilled", function(done) {
            done();
        });

        it("should reject after one promise is rejected", function(done) {
            done();
        });

        it("should return value of first fulfilled promise", function(done) {
            done();
        });

        it("should return reason of first rejected promise", function(done) {
            done();
        });

        it("should ignore non promise like values", function(done) {
            done();
        });

        it("should allow thenables", function(done) {
            done();
        });

        it("should reject if not array parameter", function(done) {
            $promise.race({}).then(function() {
                expect(false);
                done();
            }, function(reason) {
                expect(reason).toEqual(new TypeError("must pass an array to race"));
                done();
            });
        });
    });

});