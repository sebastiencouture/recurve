/** @jsx React.DOM */

"use strict";

docsModule.factory("ApiServiceExamples", ["ApiServiceExample"], function(ApiServiceExample) {

    function renderExamples(examples) {
        var key = 0;
        return examples.map(function(example) {
            key++;
            return (
                <ApiServiceExample key={key} example={example} />
            );
        });
    }

    return React.createClass({
        displayName: "ApiServiceExamples",

        propTypes: {
            examples: React.PropTypes.array
        },

        render: function() {
            var examples = this.props.examples;
            if (!examples || !examples.length) {
                return null;
            }

            return (
                <div id="examples">
                    <h3>Examples</h3>
                    {renderExamples(examples)}
                </div>
            );
        }
    });
});