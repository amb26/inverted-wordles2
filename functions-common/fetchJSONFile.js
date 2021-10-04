"use strict";

const gitOpsApi = require("git-ops-api");
const serverUtils = require("./serverUtils.js");

/**
 * An object that contains file information.
 * @typedef {Object} FetchedFileInfo
 * The structure of FetchedFileInfo varies in three scenarios:
 * 1. When the file doesn't exist:
 * @param {Boolean} exists - The value is `false`.
 * 2. When the file exists:
 * @param {Boolean} exists - The value is `true`.
 * @param {String} content - The file content.
 * @param {String} sha - The sha value of the content blob.
 * 3. When the fetch fails:
 * @param {Boolean} isError - The value is `true`.
 * @param {String} message - The error message.
 */

/**
 * Check if an JSON file in the given branch exists. If it exists, along with the existence flag, return
 * `content` and `sha` of the file's contents.
 * @param {Object} octokit - An instance of octokit with authentication set if necessary.
 * @param {String} branch - The name of the branch that the file existence will be checked against.
 * @param {String} filePath - The file path.
 * @return {Promise<FetchedFileInfo>} The yielded value of the promise contains information about the fetch status of
 * the requested file
 */
exports.fetchJSONFile = async (octokit, branch, filePath) => {
    const fetchInfo =  {
        repoOwner: serverUtils.repoOwner,
        repoName: serverUtils.repoName,
        branchName: branch,
        filePath: filePath
    };
    console.log("Beginning fetch with coordinates ", fetchInfo);
    const response = await gitOpsApi.fetchRemoteFile(octokit, fetchInfo);

    if (response.content) {
        response.content = JSON.parse(response.content);
    }

    return response;
};
