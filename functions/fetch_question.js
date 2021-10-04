"use strict";

const {
    Octokit
} = require("@octokit/core");

const serverUtils = require("../functions-common/serverUtils.js");
const fetchJSONFile = require("../functions-common/fetchJSONFile.js").fetchJSONFile;

exports.handler = async function (event) {
    console.log("Received fetch_question request at " + new Date() + " with path " + event.path);
    var branch = /fetch_question\/(.*)/.exec(event.path)[1];

    // Reject the request when:
    // 1. Not a GET request;
    // 2. Doesn’t provide required values
    if (event.httpMethod !== "GET" || !serverUtils.isParamsExist([branch])) {
        return serverUtils.invalidRequestResponse;
    }

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    try {
        const questionFileInfo = await fetchJSONFile(octokit, branch, "src/_data/question.json");
        console.log("Got questionFileInfo ", JSON.stringify(questionFileInfo));
        return {
            statusCode: 200,
            body: JSON.stringify(questionFileInfo.content)
        };
    } catch (e) {
        console.log("fetch_question error: ", e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: e
            })
        };
    }
};
