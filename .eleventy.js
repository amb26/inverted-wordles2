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
    eleventyConfig.addPassthroughCopy({"src/lib": "lib"});

    eleventyConfig.addPassthroughCopy({
        "node_modules/d3/dist/d3.min.js": "lib/d3.min.js",
        "node_modules/d3-cloud/build/d3.layout.cloud.js": "lib/d3.layout.cloud.js",
        "node_modules/uuid/dist/umd/uuidv4.min.js": "lib/uuidv4.min.js"
    });

    // Configure BrowserSync.
    eleventyConfig.setBrowserSyncConfig({
        ...eleventyConfig.browserSyncConfig,
        ghostMode: false,
        callbacks: {
            ready: function (err, bs) {
            // Whilst this 404 rendering configuration is only active in dev mode, this is necessary to ensure
            // consistency with netlify's own behaviour when the site is run in production.
            // https://docs.netlify.com/routing/redirects/redirect-options/#custom-404-page-handling
            // See original discussion on https://github.com/inclusive-design/inverted-wordles/pull/8
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
