/** @jsx React.DOM */

"use strict";

docsModule.factory("ApiModule", null, function() {

    return React.createClass({
        render: function() {
            return (
                <div>api module {this.props.name}</div>
            );
        }
    });
});