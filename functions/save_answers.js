"use strict";

const {Octokit} = require("@octokit/core");
const axios = require("axios");
const uuid = require("uuid");

const githubAPI = "https://api.github.com";

/**
 * Check if an aswer file in the given branch exists. If exists, along with the existence flag, return
 * `download_url` and `sha` of this file that will be used at the file update.
 * @param {Object} octokit An instance of octokit with authentication set.
 * @param {String} branch The name of the branch the file existence to be checked against.
 * @return {Promise} The resolved prmoise contains an object with a boolean flag keyed by `exists`. If
 * the file exists. The returned object contains keys `download_url` and `sha` of the existing file.
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
				download_url: response.data.download_url,
				sha: response.data.sha
			});
		}).catch((e) => {
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
 * Create a new answers file. The new answer is written into the file in JSON and keyed by a uuid.
 * @param {Object} octokit An instance of octokit with authentication set.
 * @param {String} branch The name of the branch the file will be created.
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
 * Update an existing answers file by appending the new answer with a uuid key to the exising file.
 * @param {Object} octokit An instance of octokit with authentication set.
 * @param {String} downloadURL The download URL of the existing file.
 * @param {String} sha The sha of the existing file.
 * @param {String} branch The name of the branch the file will be updated.
 * @param {Object} newAnswer The answer appended into the existing file.
 * @return {Promise} The resolve or reject of the promise indicate the file is updated successfully or
 * unsuccessfully.
 */
const updateAnswerFile = async (octokit, downloadURL, sha, branch, newAnswer) => {
	const uniqueId = uuid.v4();
	return new Promise((resolve, reject) => {
		// fetch the existing answers file
		axios.get(downloadURL).then((downloadResponse) => {
			const jsonFileContent = downloadResponse.data;
			jsonFileContent[uniqueId] = newAnswer;

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
		// check if answers.json exits
		const answerFileInfo = await checkAnswerFileExists(octokit, incomingData["branch"]);

		if (answerFileInfo.exists) {
			// File exists: update the existing answers file
			console.log("Updating an existing answers file...");
			await updateAnswerFile(octokit, answerFileInfo.download_url, answerFileInfo.sha, incomingData["branch"], newAnswer);
			console.log("Done: Updated the answers file.");
		} else {
			console.log("Creating a new answers file...");
			await createAnswerFile(octokit, incomingData["branch"], newAnswer);
			console.log("Done: Created the answers file.");
		}

		return {
			statusCode: 200,
			body: "Success"
		};
	} catch (e) {
		return {
			statusCode: 400,
			body: JSON.stringify({
		        error: e
	      	})
		};
	}
};
