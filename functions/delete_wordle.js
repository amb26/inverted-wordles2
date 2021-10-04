"use strict";

const gitOpsApi = require("git-ops-api");
const serverUtils = require("../functions-common/serverUtils.js");
const {
    Octokit
} = require("@octokit/core");

exports.handler = async function (event) {
    console.log("Received delete_wordle request at " + new Date() + " with path " + event.path);
    var branch = /delete_wordle\/(.*)/.exec(event.path)[1];

    // Reject the request when:
    // 1. Not a DELETE request;
    // 2. Doesn’t provide required values
    if (event.httpMethod !== "DELETE" || !serverUtils.isParamsExist([branch])) {
        return serverUtils.invalidRequestResponse;
    }

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    try {
        await gitOpsApi.deleteBranch(octokit, {
            repoOwner: serverUtils.repoOwner,
            repoName: serverUtils.repoName,
            branchName: branch
        });
        console.log("Done: the wordle branch is deleted.");
        return {
            statusCode: 200,
            body: "Deleted successfully!"
        };
    } catch (e) {
        console.log("delete_wordle error: ", e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: e
            })
        };
    }
};
