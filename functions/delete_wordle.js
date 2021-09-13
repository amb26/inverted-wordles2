"use strict";

const gitOpsApi = require("git-ops-api");
const {
    Octokit
} = require("@octokit/core");

exports.handler = async function (event) {
    console.log("Received delete_wordle request at " + new Date() + " with path " + event.path);
    var branch = /delete_wordle\/(.*)/.exec(event.path)[1];

    // Reject the request when:
    // 1. Not a DELETE request;
    // 2. Doesn’t provide required values
    if (event.httpMethod !== "DELETE" || !branch ||
        !process.env.ACCESS_TOKEN || !process.env.WORDLES_REPO_OWNER || !process.env.WORDLES_REPO_NAME) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid HTTP request method or missing field values or missing environment variables."
            })
        };
    }
    const octokit = new Octokit({
        auth: process.env.ACCESS_TOKEN
    });

    try {
        await gitOpsApi.deleteBranch(octokit, {
            repoOwner: process.env.WORDLES_REPO_OWNER,
            repoName: process.env.WORDLES_REPO_NAME,
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
