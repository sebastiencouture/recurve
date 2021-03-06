"use strict";

var fileStream = require("fs-extra");
var markdown = require("marked");
var utils = require("./docs-utils");

function getExamplePath(examplePath, filePath, options) {
    var noRoot = filePath.split(options.input)[1];
    var noExtension = noRoot.split(".")[0];

    return options.examples + noExtension + "/" + examplePath;
}

function processCodeInDescription(description) {
    if (!description) {
        return description;
    }

    return description.replace("<pre>", "<pre class='prettyprint linenums'");
}

module.exports = {
    processComments: function(comments, filePath, options) {
        var processed = [];
        comments.forEach(function(comment) {
            var processedComment = {};
            processedComment.description = this.processInternalLinks(comment.description, options.baseUrl);
            processedComment.line = comment.line;
            processedComment.codeStart = comment.codeStart;

            this.processTags(processedComment, comment.tags, filePath, options);

            processed.push(processedComment);
        }, this);

        return processed;
    },

    processTags: function(processedComment, tags, filePath, options) {
        var baseUrl = options.baseUrl;

        tags.forEach(function(tag) {
            switch (tag.type) {
                case "rdoc":
                case "name":
                case "module":
                case "service":
                case "kind":
                    processedComment[tag.type] = tag.string.trim();
                    break;
                case "type":
                    processedComment[tag.type] = tag.types;
                    break;
                case "sort":
                    processedComment[tag.type] = parseInt(tag.string);
                    break;
                case "require":
                    processedComment.requires = processedComment.requires || [];
                    processedComment.requires.push(tag.string);
                    break;
                case "example":
                    processedComment.examples = processedComment.examples || [];
                    var split = tag.string.split(" ");
                    var path = split.shift();
                    path = getExamplePath(path, filePath, options);
                    var code = fileStream.readFileSync(path, "utf8");
                    var description = split.join(" ");
                    processedComment.examples.push({
                        path: path,
                        code: code,
                        description: description
                    });
                    break;
                case "description":
                    var fullDescription = markdown(tag.string);
                    fullDescription = this.processInternalLinks(fullDescription, baseUrl);
                    fullDescription = processCodeInDescription(fullDescription);
                    processedComment.description = {
                        full: fullDescription,
                        summary: markdown(utils.getFirstLine(tag.string))
                    };
                    break;
                case "param":
                    processedComment.params = processedComment.params || [];
                    processedComment.params.push({
                        name: tag.name.trim(),
                        description: this.processInternalLinks(tag.description, baseUrl),
                        types: tag.types
                    });
                    break;
                case "throws":
                    processedComment.throws = {
                        description: this.processInternalLinks(tag.description, baseUrl),
                        types: tag.types
                    };
                    break;
                case "return":
                case "returns":
                    processedComment.returns = {
                        description: this.processInternalLinks(tag.description, baseUrl),
                        types: tag.types
                    };
                    break;
                case "private":
                    processedComment.isPrivate = true;
                    break;
                default:
                    processedComment.tags = processedComment.tags || [];
                    processedComment.tags.push({
                        type: tag.type,
                        name: tag.name.trim(),
                        description: this.processInternalLinks(tag.description, baseUrl),
                        types: tag.types
                    });
                    break;
            }
        }, this);
    },

    processInternalLinks: function (description, baseUrl) {
        if (!description) {
            return description;
        }

        // input:
        // 1. @{module.name description}
        // 2. @{module.name}
        // 3. @{module description}
        // 4. @{module}
        // output:
        // <a href="baseUrl + /module/name">description</a>

        var processedDescription = description;
        var regExp = /\@{(.*?)\}/g;

        var match = regExp.exec(description);
        while (match) {
            var original = match[0];
            var linkSplit = match[1].trim().split(" ");
            var path = linkSplit.shift();
            var pathSplit = path.split(".");
            var module = pathSplit[0];
            var name = pathSplit[1];
            var linkDescription = linkSplit.join(" ") || path;

            var anchor = '<a href="' + baseUrl + "/" + module + "/" + name + '">' + linkDescription + "</a>";
            processedDescription = processedDescription.replace(original, anchor);

            match = regExp.exec(description);
        }

        return processedDescription;
    }
};