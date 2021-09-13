"use strict";

const {
    Octokit
} = require("@octokit/core");

const gitOpsApi = require("git-ops-api");
const fetchJSONFile = require("../functions-common/fetchJSONFile.js").fetchJSONFile;

exports.handler = async function (event) {
    console.log("Received create_branch request at " + new Date() + " with path " + event.path);
    const branchName = JSON.parse(event.body).branchName;

    // Reject the request when:
    // 1. Not a POST request;
    // 2. Doesn’t provide required values;
    if (event.httpMethod !== "POST" || !branchName ||
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
        await gitOpsApi.createBranch(octokit, {
    		repoOwner: process.env.WORDLES_REPO_OWNER,
    		repoName: process.env.WORDLES_REPO_NAME,
    		baseBranchName: "main",
    		targetBranchName: branchName
    	});

        // Initialise the question file
        const lastModifiedTimestamp = new Date().toISOString();
        const questionFilePath = "src/_data/question.json";
        const questionFileInfo = await fetchJSONFile(octokit, branchName, questionFilePath);
        await gitOpsApi.updateSingleFile(octokit, {
            repoOwner: process.env.WORDLES_REPO_OWNER,
            repoName: process.env.WORDLES_REPO_NAME,
            branchName: branchName,
            filePath: questionFilePath,
            fileContent: JSON.stringify({
                workshopName: "",
                question: "",
                entries: 0,
                entryMaxLength: 80,
                createdTimestamp: lastModifiedTimestamp,
                lastModifiedTimestamp,
                branch: branchName
            }),
            commitMessage: "chore: [skip ci] update question.json when creating a new wordle",
            sha: questionFileInfo.sha
        });
        console.log("Done: the branch is created and the question file is initialized");

        return {
            statusCode: 200,
            body: JSON.stringify({
                branchName: branchName,
                lastModifiedTimestamp
            })
        };
    } catch (e) {
        console.log("create_branch error: ", e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: e
            })
        };
    }
};
