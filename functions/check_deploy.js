"use strict";

const axios = require("axios");
const serverUtils = require("../functions-common/server_utils.js");

/**
 * Support the endpoint /api/check_deploy
 */

exports.handler = async function (event) {
    console.log("Received check_deploy request at " + new Date() + " with path " + event.path);
    const incomingData = JSON.parse(event.body || {});

    // Reject the request when:
    // 1. Not a POST request;
    // 2. Doesn’t provide required values
    if (event.httpMethod !== "POST" || !serverUtils.isParamsExist([incomingData.branches])) {
        return serverUtils.invalidRequestResponse;
    }

    /**
     * Check if an URL exists.
     * @param {String} url - The URL to check.
     * @return {Boolean} Return true if the URL exists. Otherwise, return false.
     */
    const urlExists = async function (url) {
        try {
            // When the url doesn't exist, the axios call will fail with 404 status and fall into the catch block.
            await axios.head(url);
            return true;
        } catch (e) {
            return false;
        }
    };

    try {
        let resultsTogo = {};
        console.log("Got incoming data: " + JSON.stringify(incomingData, null, 2));
        for (const branch of incomingData.branches) {
            const wordleUrl = "https://" + branch + "--inverted-wordles.netlify.app/";
            resultsTogo[branch] = await urlExists(wordleUrl);
        }
        console.log("Done: " + JSON.stringify(resultsTogo));
        return {
            statusCode: 200,
            body: JSON.stringify(resultsTogo)
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
