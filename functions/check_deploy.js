"use strict";

const http = require("http");
const url = require("url");

exports.handler = async function (event) {
    console.log("Received check_deploy request at " + new Date() + " with path " + event.path);
    var branch = /check_deploy\/(.*)/.exec(event.path)[1];

    // Reject the request when:
    // 1. Not a GET request;
    // 2. Doesn’t provide required values
    if (event.httpMethod !== "GET" || !branch ||
        !process.env.ACCESS_TOKEN || !process.env.WORDLES_REPO_OWNER || !process.env.WORDLES_REPO_NAME) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid HTTP request method or missing field values or missing environment variables."
            })
        };
    }

    const checkUrlExists = async function (wordleUrl) {
        return new Promise(function (resolve, reject) {
            const req = http.request({
                method: "HEAD",
                host: url.parse(wordleUrl).host,
                port: 80,
                path: url.parse(wordleUrl).pathname
            }, function (response) {
                if (response.statusCode < 400) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });

            req.on("error", err => {
                reject(err);
            });
            req.end();
        });
    };

    try {
        const wordleUrl = "https://" + branch + "--inverted-wordles.netlify.app/";
        const isUrlExists = await checkUrlExists(wordleUrl);
        console.log("Done: the wordle url existent status", isUrlExists);
        return {
            statusCode: 200,
            body: JSON.stringify({
                exists: isUrlExists
            })
        };
    } catch (e) {
        console.log("check_deploy error: ", e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: e
            })
        };
    }
};
