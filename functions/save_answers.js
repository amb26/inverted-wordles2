"use strict";

const {Octokit} = require("@octokit/core");
const uuid = require("uuid");

const githubAPI = "https://api.github.com";

/**
 * Check if an aswer file in the given branch exists. If exists, along with the existence flag, return
 * `content` and `sha` of this file that will be used at the file update.
 * @param {Object} octokit An instance of octokit with authentication being set.
 * @param {String} branch The name of the branch that the file existence will be checked against.
 * @return {Promise} The resolved prmoise contains an object with a boolean flag keyed by `exists`. If
 * the file exists. The returned object contains `content` and `sha` information of the existing file,
 * which are needed when updating this file in the upcoming process.
 */
const checkAnswerFileExists = async (octokit, branch) => {
	return new Promise((resolve, reject) => {
		octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
			owner: process.env.WORDLES_REPO_OWNER,
			repo: process.env.WORDLES_REPO_NAME,
			path: "src/_data/answers.json",
			ref: branch
		}).then((response) => {
			resolve({
				exists: true,
				content: JSON.parse(Buffer.from(response.data.content, "base64").toString("utf-8")),
				sha: response.data.sha,
			});
		}).catch((e) => {
			// The answers file does not exist only when the returned response is "Not Found". All other error
			// responses indicate the request failure.
			if (e.message === "Not Found") {
				resolve({
					exists: false
				});
			} else {
				reject("Error at checking the existence of the answers file: " + e.message)
			}

		});
	});
};

/**
 * Create a new answers file. The new answer is written into a JSON file and keyed by a uuid.
 * @param {Object} octokit An instance of octokit with authentication being set.
 * @param {String} branch The name of the branch that the file will be created in.
 * @param {Object} newAnswer The answer written into the new file.
 * @return {Promise} The resolve or reject of the promise indicate the file is created successfully or
 * unsuccessfully.
 */
const createAnswerFile = async (octokit, branch, newAnswer) => {
	const uniqueId = uuid.v4();
	return new Promise((resolve, reject) => {
		const jsonFileContent = {};
		jsonFileContent[uniqueId] = newAnswer;

		// Create a new answers file
		octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
		    owner: process.env.WORDLES_REPO_OWNER,
		    repo: process.env.WORDLES_REPO_NAME,
		    path: "src/_data/answers.json",
			// Including "[skip ci]" in the commit message notifies notifies Netlify not to trigger a deploy.
			message: "chore: [skip ci] create answers.json",
			content: Buffer.from(JSON.stringify(jsonFileContent)).toString("base64"),
		    branch: branch
	    }).then(() => {
			resolve();
		})
		.catch((e) => {
			reject("Error at creating the answers file: ", e.message);
		})
	});
};

/**
 * Update an existing answers file by appending the new answer keyed by a uuid key to the existing file.
 * @param {Object} octokit An instance of octokit with authentication being set.
 * @param {String} jsonFileContent The content of the existing answers.json file.
 * @param {String} sha The sha of the existing file.
 * @param {String} branch The name of the branch that the file to be updated sits in.
 * @param {Object} newAnswer The answer appended to the existing file.
 * @return {Promise} The resolve or reject of the promise indicate the file is updated successfully or
 * unsuccessfully.
 */
const updateAnswerFile = async (octokit, jsonFileContent, sha, branch, newAnswer) => {
	const uniqueId = uuid.v4();
	jsonFileContent[uniqueId] = newAnswer;

	return new Promise((resolve, reject) => {
		// Update an existing answers file
		octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
		    owner: process.env.WORDLES_REPO_OWNER,
		    repo: process.env.WORDLES_REPO_NAME,
		    path: "src/_data/answers.json",
			// Including "[skip ci]" in the commit message notifies Netlify not to trigger a deploy.
			message: "chore: [skip ci] update answers.json",
			content: Buffer.from(JSON.stringify(jsonFileContent)).toString("base64"),
			sha: sha,
		    branch: branch
	    }).then(() => {
			resolve();
		})
		.catch((e) => {
			reject("Error at updating the answers file: ", e.message)
		})
	});
};

exports.handler = async function(event, context, callback) {
	const incomingData = JSON.parse(event.body);

	// Reject the request when:
	// 1. Not a POST request;
	// 2. Doesn’t provide required values
	if (event.httpMethod !== "POST" || !incomingData["branch"] || !incomingData["answers"] ||
	!process.env.ACCESS_TOKEN || !process.env.WORDLES_REPO_OWNER || !process.env.WORDLES_REPO_NAME) {
		return {
			statusCode: 400,
			body: "Invalid HTTP request method or missing field values or missing environment variables."
		};
	}

	// Main process
	const octokit = new Octokit({
		auth: process.env.ACCESS_TOKEN
	});
	const newAnswer = {
		answers: incomingData["answers"],
		createdTimestamp: new Date().toISOString()
	};

	try {
		// check if answers.json exists
		const answerFileInfo = await checkAnswerFileExists(octokit, incomingData["branch"]);

		if (answerFileInfo.exists) {
			// File exists: update the existing answers file
			console.log("Updating an existing answers file...");
			await updateAnswerFile(octokit, answerFileInfo.content, answerFileInfo.sha, incomingData["branch"], newAnswer);
			console.log("Done: Updated the answers file.");
		} else {
			// File does not exist: create a new answers file
			console.log("Creating a new answers file...");
			await createAnswerFile(octokit, incomingData["branch"], newAnswer);
			console.log("Done: Created the answers file.");
		}

		return {
			statusCode: 200,
			body: "Success"
		};
	} catch (e) {
		console.log("Error: ", e);
		return {
			statusCode: 400,
			body: JSON.stringify({
		        error: e
	      	})
		};
	}
};
