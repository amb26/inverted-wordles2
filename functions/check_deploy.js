"use strict";

const axios = require("axios");
const serverUtils = require("../functions-common/serverUtils.js");
const fetchNetlifySiteInfo = require("../functions-common/fetchNetlifySiteInfo.js").fetchNetlifySiteInfo;

// Support the endpoint /api/check_deploy
// Loop through incoming branches to find whether a branch deploy completes by querying [the Netlify deploys API]
// (https://open-api.netlify.com/#operation/showSiteTLSCertificate).
exports.handler = async function (event) {
    console.log("Received check_deploy request at " + new Date() + " with path " + event.path);
    const incomingData = JSON.parse(event.body || {});

    // Reject the request when:
    // 1. Not a POST request;
    // 2. Doesn’t provide required values
    if (event.httpMethod !== "POST" || !serverUtils.isParamsExist([incomingData.branches])) {
        return serverUtils.invalidRequestResponse;
    }

    try {
        const netlifySiteInfo = await fetchNetlifySiteInfo();
        const deploys = netlifySiteInfo.id ? await axios.get(serverUtils.netlifyApi + "/sites/" + netlifySiteInfo.id + "/deploys", {
            headers: {
                "Authorization": "Bearer " + process.env.NETLIFY_TOKEN
            }
        }) : undefined;

        let resultsTogo = {};
        for (const branch of incomingData.branches) {
            const matchedDeploy = deploys ? deploys.data.find(oneDeploy => oneDeploy.branch === branch) : undefined;
            resultsTogo[branch] = !matchedDeploy ? false : matchedDeploy.state === "ready" ? true : false;
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
