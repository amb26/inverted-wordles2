/* global uuidv4 */

"use strict";

var inverted_wordles = {};
const netlifyUrlSuffix = "--inverted-wordles.netlify.app/";

// Escape html special characters
// Reference: https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript#answer-6234804
inverted_wordles.escapeHtml = function (content) {
    return content.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

inverted_wordles.reportStatus = function (message, statusElm, isError) {
    statusElm.style.display = "block";
    statusElm.classList.remove("red");
    statusElm.classList.remove("green");
    statusElm.classList.add(isError ? "red" : "green");
    statusElm.innerHTML = message;
};

/**
 * An object that contains required values to render a wordle record.
 * @typedef {Object} wordleOptions
 * @param {String} branchName - The branch name.
 * @param {String} workshopName - The workshop name.
 * @param {String} question - The question.
 * @param {Number} entries - A number of entries for a question.
 * @param {String} lastModifiedTimestamp - The last modified timestamp.
 * @param {String} statusMsg - The message to show in the status.
 * @param {String} extraStatusClass - The extra css classes apply to the status element.
 * @param {String} extraRowClass - The extra css classes apply to the row element.
 * @param {Boolean}  disableInputs - A flag that indicates if input fields and the delete button should be disabled by default.
 * @param {Boolean} isCreateNew - A flag that indicates if the create new wordle template should be used.
 */

/**
 * Return html of a wordle record on the landing page.
 * @param {wordleOptions} wordleOptions - An instance of octokit with authentication being set.
 * @return {String} A html string mapping to a wordle record on the landing page.
 */
inverted_wordles.renderWordleRow = function (wordleOptions) {
    const disableInputs = wordleOptions.disableInputs || false;
    const isCreateNew = wordleOptions.isCreateNew || false;
    const uniqueId = uuidv4();

    let htmlTogo = `
    <div id="one-wordle-id-${ uniqueId }" class="one-wordle ${ wordleOptions.extraRowClass ? wordleOptions.extraRowClass : "" }">
        <div class="workshop-name-cell">
            <label for="workshop-name-id-${ uniqueId }">Workshop Name</label>
            <input type="text" id="workshop-name-id-${ uniqueId }" name="workshop-name" value="${ wordleOptions.workshopName }" ${ disableInputs ? "disabled" : ""}>
        </div>
        <div class="question-cell">
            <label for="question-id-${ uniqueId }">Question</label>
            <input type="text" id="question-id-${ uniqueId }" name="question" value="${ wordleOptions.question }" ${ disableInputs ? "disabled" : ""}>
        </div>
        <div class="entries-cell">
            <label for="entries-id-${ uniqueId }">Word Entries</label>
            <input type="text" id="entries-id-${ uniqueId }" name="entries" value="${ wordleOptions.entries }" ${ disableInputs ? "disabled" : ""}>
        </div>`;

    htmlTogo += isCreateNew ? `
        <div class="view-answer-cell">
            <svg role="presentation" class="view-answer-svg margin-auto">
                <use xlink:href="#ellipse"></use>
            </svg>
            Generating Link
        </div>
        <div class="view-wordle-cell">
            <svg role="presentation" class="view-wordle-svg margin-auto">
                <use xlink:href="#ellipse"></use>
            </svg>
            Generating Link
        </div>
        ` : `
        <div class="view-answer-cell">
            <label for="view-answer-id-${ uniqueId }">Answers</label>
            <a id="view-answer-id-${ uniqueId }" class="button view-answer" href="https://${ wordleOptions.branchName + netlifyUrlSuffix }answer/">
                <svg role="presentation" class="view-answer-svg">
                    <use xlink:href="#view"></use>
                </svg>
                View
            </a>
        </div>
        <div class="view-wordle-cell">
            <label for="view-wordle-id-${ uniqueId }">Wordle</label>
            <a id="view-wordle-id-${ uniqueId }" class="button view-wordle" href="https://${ wordleOptions.branchName + netlifyUrlSuffix }wordle/">
                <svg role="presentation" class="view-wordle-svg">
                    <use xlink:href="#view"></use>
                </svg>
                View
            </a>
        </div>
        `;

    htmlTogo += `
        <div class="last-modified-cell">
            <label for="last-modified-id-${ uniqueId }">Last Modified</label>
            <span id="last-modified-id-${ uniqueId }">${ wordleOptions.lastModifiedTimestamp }</span>
        </div>
        <div class="delete-cell">
            <button id="delete-id-${ uniqueId }" class="delete-button ${ wordleOptions.extraRowClass ? wordleOptions.extraRowClass : "" }" ${ disableInputs ? "disabled" : ""}>
                <svg role="presentation" class="view-answer-svg">
                    <use xlink:href="#cross"></use>
                </svg>
                Delete
            </button>
        </div>
        <div class="one-status ${ wordleOptions.extraStatusClass ? wordleOptions.extraStatusClass : "" } ${ wordleOptions.statusMsg ? "" : "hidden" }" role="status">${ wordleOptions.statusMsg ? wordleOptions.statusMsg : "" }</div>
        <input type="hidden" name="branchName" value="${ wordleOptions.branchName }">
    </div>\n\n`;

    return htmlTogo;
};

inverted_wordles.findWordleRowByBranchName = function (wordlesAreaSelector, branchName) {
    const wordlesListElm = document.querySelector(wordlesAreaSelector);
    // On the wordle list, find the row with the same branch name
    const branchNameElm = wordlesListElm.querySelector("input[value=\"" + branchName + "\"]");
    // Remove the old wordle row
    return branchNameElm.parentElement;
};

/**
 * An object that contains file information.
 * @typedef {Object} WordleValues
 * @param {String} branchName - The branch name.
 * @param {String} workshopName - The workshop name.
 * @param {String} question - The question.
 * @param {Number} entries - The entries.
 * @param {String} lastModifiedTimestamp - Last modified timestamp.
 */

/**
 * Update the wordle row rendered for a specific branch.
 * @param {String} wordlesAreaSelector - The wordles area selector.
 * @param {WordleValues} wordleValues - Values to be rendered for this Wordle.
 */
inverted_wordles.updateWordleRow = function (wordlesAreaSelector, wordleValues) {
    // Remove the existing wordle row for the given branch
    inverted_wordles.findWordleRowByBranchName(wordlesAreaSelector, wordleValues.branchName).remove();

    // Get the html for the new row
    const newWordleRow = inverted_wordles.renderWordleRow({
        branchName: wordleValues.branchName,
        workshopName: wordleValues.workshopName,
        question: wordleValues.question,
        entries: wordleValues.entries,
        lastModifiedTimestamp: wordleValues.lastModifiedTimestamp
    });

    // append the new row to the wordle list
    document.querySelector(wordlesAreaSelector).innerHTML += newWordleRow;
};

/**
 * Append the wordle row that is in the process of deploy to the wordle list.
 * @param {String} wordlesAreaSelector - The wordles area selector.
 * @param {WordleValues} wordleValues - Values to be rendered for this Wordle.
 */
inverted_wordles.appendInDeployWordleRow = function (wordlesAreaSelector, wordleValues) {
    const newWordleRow = inverted_wordles.renderWordleRow({
        branchName: wordleValues.branchName,
        workshopName: wordleValues.workshopName,
        question: wordleValues.question,
        entries: wordleValues.entries,
        lastModifiedTimestamp: wordleValues.lastModifiedTimestamp,
        statusMsg: "*Please wait until the question link is generated and webpage is created. This may take 30 seconds*",
        extraStatusClass: "purple",
        extraRowClass: "grey-background",
        disableInputs: true,
        isCreateNew: true
    });

    // append the new row to the wordle list
    document.querySelector(wordlesAreaSelector).innerHTML += newWordleRow;
};

/**
 * Bind the polling event to check if a branch deploy completes.
 * @param {String} wordlesAreaSelector - The wordles area selector.
 * @param {String} createButtonSelector - The create button selector.
 * @param {WordleValues} wordleValues - Values to be rendered for this Wordle.
 */
inverted_wordles.bindPolling = function (wordlesAreaSelector, createButtonSelector, wordleValues) {
    // Disable "new question" button
    document.querySelector(createButtonSelector).disabled = true;

    // Check if the new branch has been deployed. The check runs every 2 seconds in 2 minutes.
    // The check stops in one of these two conditions:
    // 1. The site is not up running after 2 minutes;
    // 2. The deploy is up running.
    // When the new wordle web pages are deployed, update the wordle list with a proper row.
    let timesCheck = 0;
    let checkDeployInterval = setInterval(function () {
        fetch("/api/check_deploy/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                branches: [wordleValues.branchName]
            })
        }).then(response => {
            if (response.status === 200) {
                response.json().then(res => {
                    if (res[wordleValues.branchName]) {
                        clearInterval(checkDeployInterval);
                        // Update the new wordle row to a regular row when the deploy is up and running
                        inverted_wordles.updateWordleRow(wordlesAreaSelector, {
                            branchName: wordleValues.branchName,
                            workshopName: wordleValues.workshopName,
                            question: wordleValues.question,
                            entries: wordleValues.entries,
                            lastModifiedTimestamp: wordleValues.lastModifiedTimestamp
                        });

                        // Bind events for input elements and buttons on the new wordle row
                        const wordleRow = inverted_wordles.findWordleRowByBranchName(wordlesAreaSelector, wordleValues.branchName);
                        inverted_wordles.bindInputFieldEvents(wordleRow);
                        inverted_wordles.bindDeleteEvents(wordleRow);

                        // Enable the "new question" button
                        document.querySelector(createButtonSelector).disabled = false;
                    }
                });
            }
        });

        timesCheck++;
        if (timesCheck === 60) {
            clearInterval(checkDeployInterval);
        }
    }, 2000);
};
