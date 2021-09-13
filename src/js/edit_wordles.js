"use strict";

/* global globalOptions, inverted_wordles */

// Bind onChange events for all input fields that users will change values
inverted_wordles.bindInputFieldEvents = function (containerElm) {
    const inputElements = containerElm.getElementsByTagName("input");
    for (let i = 0; i < inputElements.length; i++) {
        const currentInput = inputElements[i];
        // Only bind for user controlled input fields
        if (globalOptions.inputFieldNames.includes(currentInput.getAttribute("name"))) {
            currentInput.addEventListener("change", evt => {
                const parentContainer = currentInput.parentElement.parentElement;
                const oneStatusElm = parentContainer.querySelector(globalOptions.selectors.oneStatus);
                // Set the data to be saved
                let dataTogo = {};
                dataTogo[evt.target.name] = evt.target.value;
                dataTogo.branchName = parentContainer.querySelector("[name=\"" + globalOptions.branchNameField + "\"]").value;

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
                                inverted_wordles.reportStatus("*FAILED: New edits FAILED. Error: " + res.error + "*", oneStatusElm, true);
                            });
                        } else {
                            response.json().then(res => {
                                // Find the last modified element and set the new timestamp
                                const lastModifiedElm = currentInput.parentElement.parentElement.querySelector("[id^=\"" + globalOptions.lastModifiedIdPrefix + "\"]");
                                lastModifiedElm.textContent = res.lastModifiedTimestamp.substring(0, 10).replace(/-/g, "/");
                                // Report the success status
                                inverted_wordles.reportStatus("*New edits SUCCESSFUL*", oneStatusElm, false);
                            });
                        }
                    },
                    error => {
                        error.json().then(err => {
                            inverted_wordles.reportStatus("*FAILED: New edits FAILED. Error: " + err.error + "*", oneStatusElm, true);
                        });
                    }
                );
            });
        }
    }
};
