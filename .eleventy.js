"use strict";

const fs = require("fs");
const errorOverlay = require("eleventy-plugin-error-overlay");

const htmlMinifyTransform = require("./src/transforms/html-minify.js");
const slugFilter = require("./src/filters/slug.js");

module.exports = function (eleventyConfig) {
    // Watch SCSS files.
    eleventyConfig.addWatchTarget("./src/scss/");

    // Add plugins.
    eleventyConfig.addPlugin(errorOverlay);

    // Add filters.
    eleventyConfig.addFilter("slug", slugFilter);

    // Add transforms.
    eleventyConfig.addTransform("htmlmin", htmlMinifyTransform);

    // Configure passthrough file copy.
    eleventyConfig.addPassthroughCopy({"manifest.json": "manifest.json"});
    eleventyConfig.addPassthroughCopy({"src/js": "js"});

    eleventyConfig.addPassthroughCopy({
        "node_modules/d3/dist/d3.min.js": "lib/d3.min.js",
        "node_modules/d3-cloud/build/d3.layout.cloud.js": "lib/d3.layout.cloud.js"
    });

    // Configure BrowserSync.
    eleventyConfig.setBrowserSyncConfig({
        ...eleventyConfig.browserSyncConfig,
        ghostMode: false,
        callbacks: {
            ready: function (err, bs) {
                bs.addMiddleware("*", (req, res) => {
                    const content_404 = fs.readFileSync("dist/404.html");
                    // Provides the 404 content without redirect.
                    res.write(content_404);
                    res.writeHead(404);
                    res.end();
                });
            }
        }
    });

    return {
        dir: {
            input: "src",
            output: "dist"
        },
        passthroughFileCopy: true
    };
};
