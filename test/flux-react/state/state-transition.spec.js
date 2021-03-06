"use strict";

describe("$stateTransition", function() {
    var $async;
    var $stateConfig;
    var $state;
    var $stateTransition;

    var parentConfig;
    var childConfig;
    var stateTransition;

    function setupParent(beforeResolve, afterResolve, resolve, shouldTriggerChangeAction) {
        parentConfig = $stateConfig("parent", {path: "a", resolver: {
            beforeResolve: beforeResolve,
            afterResolve: afterResolve,
            shouldTriggerChangeAction: shouldTriggerChangeAction,
            resolve: {
                a: resolve
            }
        }});
    }

    function setupChild(beforeResolve, afterResolve, resolve) {
        childConfig = $stateConfig("parent.child", {path: "b", parent: parentConfig, resolver: {
            beforeResolve: beforeResolve,
            afterResolve: afterResolve,
            resolve: {
                a: resolve
            }
        }});
    }

    function transition(configs, prevStates, params, onChanged, onRedirected) {
        stateTransition = $stateTransition(configs, prevStates, params);
        if (onChanged) {
            stateTransition.changed.on(onChanged);
        }
        if (onRedirected) {
            stateTransition.redirected.on(onRedirected);
        }

        stateTransition.start();
        $async.flush();
    }

    function clearTransition() {
        if (!stateTransition) {
            return;
        }

        stateTransition.cancel();
        stateTransition.changed.off();
        stateTransition.redirected.off();
    }

    function getParentState() {
        return stateTransition.getStates()[0];
    }

    beforeEach(function() {
        recurve.flux.react.$module.exports([]);
        $include(recurve.flux.react.$module);

        $invoke(["$async", "$stateConfig", "$state", "$stateTransition"],
            function(asyncService, stateConfigService, stateService, stateTransitionService) {
            $async = asyncService;
            $stateConfig = stateConfigService;
            $state = stateService;
            $stateTransition = stateTransitionService;
        });
    });

    afterEach(function() {
        clearTransition();
    });

    it("should be invokable", function() {
        expect($stateTransition).toBeDefined();
        expect(isFunction($stateTransition)).toEqual(true);
    });

    describe("start", function() {
        describe("config", function() {
            var stateConfigs;
            var prevStates;
            var states;
            var routeParams = {id: 1};

            function addStateConfig(name, createPrevState) {
                var stateConfig = $stateConfig(name, {path: name, resolver: {}});
                stateConfigs.push(stateConfig);

                if (createPrevState) {
                    var state = $state(stateConfig);
                    prevStates.push(state);
                }
            }

            beforeEach(function() {
                prevStates = [];
                stateConfigs = [];

                addStateConfig("a", true);
                addStateConfig("b", true);
                addStateConfig("c");

                var transition = $stateTransition(stateConfigs, prevStates, routeParams);
                transition.start();
                states = transition.getStates();
            });

            it("should maintain the same state order as the passed in state configs", function() {
                expect(states[0].config).toBe(stateConfigs[0]);
                expect(states[1].config).toBe(stateConfigs[1]);
                expect(states[2].config).toBe(stateConfigs[2]);
            });

            it("should not re-create states for configs that exist in the set of previous states if they have the same params", function() {
                prevStates = [];
                stateConfigs = [];

                var stateConfig = $stateConfig(name, {path: ":id", resolver: {}});
                stateConfigs.push(stateConfig);

                var state = $state(stateConfig, null, {id: 1});
                prevStates.push(state);

                var transition = $stateTransition(stateConfigs, prevStates, {id: 1});
                transition.start();
                states = transition.getStates();

                expect(states[0]).toBe(prevStates[0]);
            });

            it("should re-create states for configs that exist in the set of previous states but with different params", function() {
                prevStates = [];
                stateConfigs = [];

                var stateConfig = $stateConfig(name, {path: ":id", resolver: {}});
                stateConfigs.push(stateConfig);

                var state = $state(stateConfig, null, {id: 1});
                prevStates.push(state);

                var transition = $stateTransition(stateConfigs, prevStates, {id: 2});
                transition.start();
                states = transition.getStates();

                expect(states[0]).not.toBe(prevStates[0]);
            });

            it("should not re-create states for configs that exist in the set of previous states but the params don't affect the state", function() {
                prevStates = [];
                stateConfigs = [];

                var stateConfig = $stateConfig(name, {path: ":test", resolver: {}});
                stateConfigs.push(stateConfig);

                var state = $state(stateConfig, null, {id: 1});
                prevStates.push(state);

                var transition = $stateTransition(stateConfigs, prevStates, {id: 2});
                transition.start();
                states = transition.getStates();

                expect(states[0]).toBe(prevStates[0]);
            });

            it("should not re-create states for configs that exist in the set of previous states with no params", function() {
                expect(states[0]).toBe(prevStates[0]);
                expect(states[1]).toBe(prevStates[1]);
            });

            it("should not re-create states for configs that exist in the set of previous states but with same params", function() {
                expect(states[0]).toBe(prevStates[0]);
                expect(states[1]).toBe(prevStates[1]);
            });

            it("should set the route params on new states", function() {
                expect(states[2].params).toBe(routeParams);
            });

            it("should update the route params on previous states", function() {
                prevStates = [];
                stateConfigs = [];

                var stateConfig = $stateConfig(name, {path: ":test", resolver: {}});
                stateConfigs.push(stateConfig);

                var state = $state(stateConfig, null, {id: 1});
                prevStates.push(state);

                var updatedParams = {id: 2};
                var transition = $stateTransition(stateConfigs, prevStates, updatedParams);
                transition.start();
                states = transition.getStates();

                expect(states[0].params).toBe(updatedParams);
            });
        });

        it("should call beforeResolve before resolving", function() {
            var beforeResolve = jasmine.createSpy();
            var called = false;
            setupParent(beforeResolve, null, function() {
                called = true;
                expect(beforeResolve).toHaveBeenCalled();
            });

            transition([parentConfig]);
            expect(called).toEqual(true);
        });

        it("should set all unresolved states to loading before resolving", function() {
            setupParent(function() {
                expect(stateTransition.getStates()[0].loading).toEqual(true);
                expect(stateTransition.getStates()[1].loading).toEqual(true);
            });

            setupChild();

            transition([parentConfig, childConfig]);
        })

        it("should throw error if beforeResolve throws an error", function() {
            var error = new Error("oops!");
            setupParent(function() {
                throw error;
            });

            expect(function() {
                transition([parentConfig]);
            }).toThrow(error);
        });

        it("should stop transition if beforeResolve redirects", function() {
            function beforeResolve(redirect) {
                redirect("b");
            }
            var resolve = jasmine.createSpy("resolve");
            var afterResolve = jasmine.createSpy("afterResolve");
            setupParent(beforeResolve, afterResolve, resolve);
            transition([parentConfig]);

            expect(resolve).not.toHaveBeenCalled();
            expect(afterResolve).not.toHaveBeenCalled();
        });

        it("should include the state as second param to beforeResolve", function() {
            var beforeResolve = jasmine.createSpy("beforeResolve");
            setupParent(beforeResolve, null, function() {
                return "a";
            });
            transition([parentConfig]);

            expect(beforeResolve.calls.argsFor(0)[1]).toEqual(getParentState());
        });

        it("should error if resolve throws an error", function() {
            var error = new Error("oops!");
            setupParent(null, null, function() {
                throw error;
            });
            transition([parentConfig]);

            expect(getParentState().error).toBe(error);
            expect(getParentState().loading).toEqual(false);
        });

        it("should call afterResolve after resolving", function() {
            var resolve = jasmine.createSpy();
            var called = false;
            setupParent(null, function() {
                called = true;
                expect(resolve).toHaveBeenCalled();
            }, resolve);

            transition([parentConfig]);

            expect(called).toEqual(true);
        });

        it("should call afterResolve if resolving throws an error", function() {
            var error = new Error("oops!");
            var afterResolve = jasmine.createSpy("afterResolve");
            setupParent(null, afterResolve, function() {
                throw error;
            });
            transition([parentConfig]);

            expect(afterResolve).toHaveBeenCalled();
        });

        it("should throw error if afterResolve throws an error", function() {
            var error = new Error("oops!");
            setupParent(null, function() {
                throw error;
            });

            expect(function() {
                transition([parentConfig]);
            }).toThrow(error);
        });

        it("should not resolve anymore states if afterResolve redirects", function() {
            setupParent(null, function(redirect) {
                redirect("c");
            }, null);

            var callback = jasmine.createSpy("callback");
            setupChild(callback, callback, callback);

            transition([parentConfig, childConfig]);

            expect(callback).not.toHaveBeenCalled();
        });

        it("should include the state as second param to afterResolve", function() {
            var afterResolve = jasmine.createSpy("afterResolve");
            setupParent(null, afterResolve, function() {
                return "a";
            });
            transition([parentConfig]);

            expect(afterResolve.calls.argsFor(0)[1]).toEqual(getParentState());
        });

        it("should set the state to resolved after resolving", function() {
            setupParent();
            transition([parentConfig]);

            expect(getParentState().resolved).toEqual(true);
        });

        it("should start resolving the next state after resolving the previous", function() {
            setupParent();

            var called = false;
            setupChild(function() {
                called = true;
                expect(getParentState().resolved).toEqual(true);
            });

            transition([parentConfig, childConfig]);

            expect(called).toEqual(true);
        });

        it("should not attempt to resolve anymore states if one errors", function() {
            var error = new Error("oops!");
            setupParent(null, null, function() {
                throw error;
            });

            var callback = jasmine.createSpy("callback");
            setupChild(callback, callback, callback);

            transition([parentConfig, childConfig]);

            expect(callback).not.toHaveBeenCalled();
        });

        it("should throw an error if already started", function() {
            setupParent();
            transition([parentConfig]);

            expect(function() {
                stateTransition.start();
            }).toThrowError("state transition can only be started once");
        });

        describe("previous states", function() {
            it("should not attempt to resolve a state that is already resolved", function() {
                var callback = jasmine.createSpy("callback");
                setupParent(null, null, callback);
                transition([parentConfig]);

                var prevStates = stateTransition.getStates();

                clearTransition();
                callback.calls.reset();

                setupChild();
                transition([parentConfig, childConfig], prevStates);

                expect(callback).not.toHaveBeenCalled();
            });

            it("should resolve a state that was not resolved in the previous state set", function() {
                var callback = jasmine.createSpy("callback");
                var throwError = true;
                setupParent(null, null, function() {
                    if (throwError) {
                        throwError = false;
                        throw new Error("ooops!");
                    }
                    throwError = false;
                });
                transition([parentConfig]);

                var prevStates = stateTransition.getStates();
                clearTransition();
                callback.calls.reset();

                expect(getParentState().resolved).toEqual(false);

                setupChild();
                transition([parentConfig, childConfig], prevStates);

                expect(getParentState().resolved).toEqual(true);
            });

            it("should not call beforeResolve for a state that is already resolved", function() {
                var callback = jasmine.createSpy("callback");
                setupParent(callback);
                transition([parentConfig]);

                var prevStates = stateTransition.getStates();

                clearTransition();
                callback.calls.reset();

                setupChild();
                transition([parentConfig, childConfig], prevStates);

                expect(callback).not.toHaveBeenCalled();
            });

            it("should not call afterResolve for a state that is already resolved", function() {
                var callback = jasmine.createSpy("callback");
                setupParent(null, callback);
                transition([parentConfig]);

                var prevStates = stateTransition.getStates();

                clearTransition();
                callback.calls.reset();

                setupChild();
                transition([parentConfig, childConfig], prevStates);

                expect(callback).not.toHaveBeenCalled();
            });
        });
    });

    describe("cancel", function() {
        var callback;

        beforeEach(function() {
            callback = jasmine.createSpy("callback");
        });

        it("should stop transition if canceled while resolving", function() {
            setupParent(null, null, function() {
                stateTransition.cancel();
            });

            transition([parentConfig], null, null, callback);

            expect(getParentState().resolved).toEqual(false);
            expect(getParentState().loading).toEqual(true);
            expect(callback.calls.count()).toEqual(1);
        });

        it("should not transition if called before start", function() {
            setupParent();

            stateTransition = $stateTransition([parentConfig]);
            stateTransition.changed.on(callback);

            stateTransition.cancel();
            stateTransition.start();
            $async.flush();

            expect(callback).not.toHaveBeenCalled();
        });

        it("should not throw an error if called multiple times", function() {
            setupParent();

            stateTransition = $stateTransition([parentConfig]);
            stateTransition.cancel();
            stateTransition.cancel();
        });
    });

    describe("changed", function() {
        var callback;

        beforeEach(function() {
            callback = jasmine.createSpy("callback");
        });

        it("should not trigger after redirecting during beforeResolve", function() {
            setupParent(function(redirect) {
                redirect("c");
            });

            var callback = jasmine.createSpy("callback");
            transition([parentConfig], null, null, callback);

            expect(callback).not.toHaveBeenCalled();
        });

        it("should trigger with the state set to loading before resolving", function() {
            var resolve = jasmine.createSpy("resolve");
            setupParent(null, null, resolve);

            var callCount = 0;
            transition([parentConfig], null, null, function(states) {
                callCount++;
                if (1 < callCount) {
                    return;
                }

                expect(states[0].loading).toEqual(true);
                expect(resolve).not.toHaveBeenCalled();
            });

            expect(callCount).toEqual(2);
        });

        it("should trigger if resolve throws an error", function() {
            var error = new Error("oops!");
            setupParent(null, null, function() {
                throw error;
            });
            transition([parentConfig], null, null, callback);

            expect(callback.calls.count()).toEqual(2);
        });

        it("should trigger after successfully resolving", function() {
            setupParent();

            var callback = jasmine.createSpy("callback");
            transition([parentConfig], null, null, callback);

            expect(callback.calls.count()).toEqual(2);
        });

        it("should not trigger after redirecting during beforeResolve", function() {
            setupParent(null, function(redirect) {
                redirect("c");
            }, null);

            var callback = jasmine.createSpy("callback");
            transition([parentConfig], null, null, callback);

            expect(callback.calls.count()).toEqual(1);
        });

        it("should include the set of states as params", function() {
            setupParent();

            var callback = jasmine.createSpy("callback");
            transition([parentConfig], null, null, callback);

            expect(callback.calls.mostRecent().args[0]).toEqual(stateTransition.getStates());
        });

        it("should not trigger a change for a state that is already resolved (or no data to resolve)", function() {
            parentConfig = $stateConfig("parent", {path: "a", resolver: {}});
            setupChild();

            var called = false;
            transition([parentConfig, childConfig], null, null, function(states) {
                called = true;
                expect(states[0].resolved).toEqual(true);
            });

            expect(called).toEqual(true);
        });

        // use case => start app and all states don't require any data to resolve
        it("should trigger once if all states are already resolved on start", function() {
            var config = $stateConfig("a", {path: "a", resolver: {}});
            transition([config], null, null, callback);

            expect(callback.calls.count()).toEqual(1);
        });

        describe("shouldTriggerChangeAction", function() {
            it("should include the state as param", function() {
                setupParent(null, null, null, callback);
                transition([parentConfig]);

                expect(callback).toHaveBeenCalledWith(getParentState());
            });

            it("should trigger if returns true", function() {
                var resolve = jasmine.createSpy("resolve");
                setupParent(null, null, resolve, function() {
                    return true;
                });

                var callCount = 0;
                transition([parentConfig], null, null, function(states) {
                    callCount++;
                    if (1 < callCount) {
                        return;
                    }

                    expect(states[0].loading).toEqual(true);
                    expect(resolve).not.toHaveBeenCalled();
                });

                expect(callCount).toEqual(2);
            });

            it("should not trigger loading state change if returns false", function() {
                setupParent(null, null, null, function(state) {
                    return !state.loading;
                });

                transition([parentConfig], null, null, callback);

                expect(callback.calls.count()).toEqual(1);
                expect(getParentState().resolved).toEqual(true);
            });

            it("should not trigger resolved state change if returns false", function() {
                setupParent(null, null, null, function(state) {
                    return !state.resolved;
                });

                transition([parentConfig], null, null, callback);

                expect(callback.calls.count()).toEqual(1);
                expect(getParentState().resolved).toEqual(true);
            });

            it("should not trigger error state change if returns false", function() {
                var error = new Error("oops!");
                setupParent(null, null, function() {
                    throw new Error("oops!");
                }, function(state) {
                    return !state.error;
                });

                transition([parentConfig], null, null, callback);

                expect(callback.calls.count()).toEqual(1);
                expect(getParentState().error).toEqual(error);
            });
        });
    });

    describe("redirected", function() {
        function testRedirect(beforeResolve, afterResolve) {
            setupParent(beforeResolve, afterResolve);

            var callback = jasmine.createSpy("callback");
            transition([parentConfig], null, null, null, callback);

            expect(callback.calls.count()).toEqual(1);
        }

        function redirectHandler(redirect) {
            redirect("name", "params", "historyState", "options");
        }

        it("should trigger on redirect within beforeResolve", function() {
            testRedirect(redirectHandler);
        });

        it("should trigger on redirect within afterResolve", function() {
            testRedirect(null, redirectHandler);
        });

        it("should include name, params, historyState, options as params", function() {
            setupParent(redirectHandler);

            var callback = jasmine.createSpy("callback");
            transition([parentConfig], null, null, null, callback);

            expect(callback.calls.mostRecent().args).toEqual(["name", "params", "historyState", "options"]);
        });
    });
});