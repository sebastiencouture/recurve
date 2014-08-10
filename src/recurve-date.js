"use strict";

module.exports = {
    now: function() {
        return new Date().getTime();
    },

    performanceNow: function() {
        return performance && performance.now ? performance.now() : this.now();
    },

    startYearFromRange: function(range) {
        if (!range) {
            return "";
        }

        var split = range.split("-");
        return 0 < split.length ? split[0] : "";
    },

    endYearFromRange: function(range) {
        if (!range) {
            return "";
        }

        var split = range.split("-");
        return 2 < split.length ? split[2] : "";
    }
};