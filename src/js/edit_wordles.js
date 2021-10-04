"use strict";

/* global inverted_wordles */

/**
 * Bind onChange events for user controlled input fields found in the given container. It is the caller's
 * responsibility to ensure this function is called only once on each newly generated block of markup.
 * Currently, this function is called in two cases:
 * 1. At the page load when all wordles are rendered;
 * 2. When a new wordle is created and added to the wordle list.
 * @param {DOMElement} containerElm - The DOM element of the holding container to find input fields.
 * @param {Object} options - The value of inverted_wordles.manage.globalOptions.
 */
inverted_wordles.manage.bindInputFieldEvents = function (containerElm, options) {
    const inputElements = containerElm.getElementsByTagName("input");
    for (let i = 0; i < inputElements.length; i++) {
        const currentInput = inputElements[i];
        // Only bind for user controlled input fields
        if (options.inputFieldNames.includes(currentInput.getAttribute("name")) && !currentInput.disabled) {
            currentInput.addEventListener("change", evt => {
                const parentContainer = currentInput.parentElement.parentElement;
                const oneStatusElm = parentContainer.querySelector(options.selectors.oneStatus);
                // Set the data to be saved
                let dataTogo = {};
                dataTogo[evt.target.name] = evt.target.value;
                dataTogo.branch = parentContainer.querySelector("[name=\"" + options.branchNameField + "\"]").value;

                fetch("/api/save_question", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dataTogo)
                }).then(
                    response => {
                        // Javascript fetch function does not reject when the status code is between 400 to 600.
                        // This range of status code needs to be handled specifically in the success block.
                        // See https://github.com/whatwg/fetch/issues/18
                        if (response.status >= 400 && response.status < 600) {
                            response.json().then(res => {
                                inverted_wordles.manage.reportStatus("*FAILED: New edits FAILED. Error: " + res.error + "*", oneStatusElm, true);
                            });
                        } else {
                            response.json().then(res => {
                                // Find the last modified element and set the new timestamp
                                const lastModifiedElm = currentInput.parentElement.parentElement.querySelector("[id^=\"" + options.lastModifiedIdPrefix + "\"]");
                                lastModifiedElm.textContent = res.lastModifiedTimestamp.substring(0, 10).replace(/-/g, "/");
                                // Report the success status
                                inverted_wordles.manage.reportStatus("*New edits SUCCESSFUL*", oneStatusElm, false);
                            });
                        }
                    },
                    error => {
                        error.json().then(err => {
                            inverted_wordles.manage.reportStatus("*FAILED: New edits FAILED. Error: " + err.error + "*", oneStatusElm, true);
                        });
                    }
                );
            });
        }
    }
};
