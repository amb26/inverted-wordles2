"use strict";

const axios = require("axios");
const serverUtils = require("../functions-common/server_utils.js");
const netlifySiteApi = "https://api.netlify.com/api/v1/sites";

/**
 * Support the endpoint /api/check_netlify_site
 * It makes use of [the Netlify /sites API](https://api.netlify.com/api/v1/sites), and search through its entire
 * response to find out whether the expected repo, defined via environment variables WORDLES_REPO_OWNER and
 * WORDLES_REPO_NAME, is found in the build_settings field. See https://docs.netlify.com/api/get-started/#get-sites
 */

exports.handler = async function (event) {
    console.log("Received check_netlify_site request at " + new Date());

    // Reject the request when:
    // 1. Not a GET request;
    // 2. Doesn’t provide required values
    if (event.httpMethod !== "GET" || !process.env.WORDLES_REPO_OWNER || !process.env.WORDLES_REPO_NAME || !process.env.NETLIFY_TOKEN) {
        return serverUtils.invalidRequestResponse;
    }

    try {
        const expectedRepoUrl = "https://github.com/" + process.env.WORDLES_REPO_OWNER + "/" + process.env.WORDLES_REPO_NAME;
        const netlifyResponse = await axios.get(netlifySiteApi, {
            headers: {
                "Authorization": "Bearer " + process.env.NETLIFY_TOKEN
            }
        });
        console.log("Got netlify reponse data of ", JSON.stringify(netlifyResponse.data, null, 2));

        const isNetlifySite = netlifyResponse.data.some(oneSite => oneSite.build_settings.repo_url === expectedRepoUrl);

        console.log("Done: if the current site is a Netlify site: " + isNetlifySite);
        return {
            statusCode: 200,
            body: JSON.stringify({
                isNetlifySite
            })
        };
    } catch (e) {
        console.log("check_netlify_site error: ", e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: e.response.statusText
            })
        };
    }
};
