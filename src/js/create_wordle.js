"use strict";

/* global inverted_wordles, aria, uuidv4 */

/**
 * Bind event listeners for the "create question" button.
 * @param {Object} options - The value of inverted_wordles.manage.globalOptions.
 */
inverted_wordles.manage.bindCreateEvent = function (options) {
    const createButton = document.querySelector(options.selectors.createButton);
    createButton.addEventListener("click", evt => aria.openDialog(options.createDialogId, evt.target.id, options.createCancelId));
};

/**
 * Create a wordle.
 * @param {Object} options - The value of inverted_wordles.manage.globalOptions.
 */
inverted_wordles.manage.createWordle = function (options) {
    const generalStatusElm = document.querySelector(options.selectors.status);
    const branchName = uuidv4();

    // create the branch
    fetch("/api/create_branch", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            branchName
        })
    }).then(response => {
        // Javascript fetch function does not reject when the status code is between 400 to 600.
        // This range of status code needs to be handled specifically in the success block.
        // See https://github.com/whatwg/fetch/issues/18
        if (response.status >= 400 && response.status < 600) {
            response.json().then(res => {
                inverted_wordles.manage.reportStatus("Error at creating a new wordle: " + res.error, generalStatusElm, true);
            });
        } else {
            response.json().then(res => {
                const lastModifiedTimestamp = res.lastModifiedTimestamp.substring(0, 10).replace(/-/g, "/");

                // Append the new wordle row to the wordle list
                inverted_wordles.manage.appendInDeployWordleRow(options.selectors.wordlesArea, {
                    branchName,
                    workshopName: "",
                    question: "",
                    entries: 0,
                    lastModifiedTimestamp,
                    deployStatus: options.deployStatus.inProgress
                });

                // Bind the polling event to update the wordle row when the deploy is ready
                inverted_wordles.manage.bindDeploymentPolling({
                    branchName,
                    workshopName: "",
                    question: "",
                    entries: 0,
                    lastModifiedTimestamp
                }, options);
            });
        }
    }, error => {
        error.json().then(err => {
            inverted_wordles.manage.reportStatus("Error at creating a new wordle: " + err.error, generalStatusElm, true);
        });
    });
};
