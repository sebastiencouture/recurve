/** @jsx React.DOM */

"use strict";

docsModule.factory("ApiServiceProperty", ["utils", "ApiServiceName"], function(utils, ApiServiceName) {

    return React.createClass({
        displayName: "ApiServiceProperty",

        propTypes: {
            property: React.PropTypes.object.isRequired
        },

        render: function() {
            var property = this.props.property;
            return (
                <div className="property">
                    <ApiServiceName name={property.name} type={utils.join(property.type)} />
                    <div className="description-detailed" dangerouslySetInnerHTML={{__html: property.description.full}} />
                </div>
            );
        }
    });
});