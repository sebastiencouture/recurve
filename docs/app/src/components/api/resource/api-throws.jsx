/** @jsx React.DOM */

"use strict";

docsModule.factory("ApiThrows", null, function() {

    return React.createClass({
        displayName: "ApiReturns",

        propTypes: {
            throws: React.PropTypes.object.isRequired
        },

        render: function() {
            var throws = this.props.throws;
            if (!throws) {
                return null;
            }

            return (
                <div>
                    <h4>Throws</h4>
                    <div className="throws">
                        <strong>{throws.type}</strong>
                        <div className="description" dangerouslySetInnerHTML={{__html: throws.description}} />
                    </div>
                </div>
            );
        }
    });
});