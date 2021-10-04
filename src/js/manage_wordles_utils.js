/* global inverted_wordles, uuidv4 */

"use strict";

/**
 * Escape html special characters.
 * See: https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript#answer-6234804
 * @param {String} content - A html content to be escaped.
 * @return {String} Escaped content.
 */
inverted_wordles.manage.escapeHtml = function (content) {
    return content.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

/**
 * Show a message in a status element.
 * @param {String} message - A message to show.
 * @param {DOMElement} statusElm - The status DOM element.
 * @param {Boolean} isError - Indicate if the message is a regular message or an error.
 */
inverted_wordles.manage.reportStatus = function (message, statusElm, isError) {
    statusElm.style.display = "block";
    statusElm.classList.remove("error");
    statusElm.classList.remove("success");
    statusElm.classList.add(isError ? "error" : "success");
    statusElm.innerHTML = message;
};

/**
 * An object that contains required values to render a wordle row.
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
 * @param {wordleOptions} wordleOptions - Values required to render a wordle row.
 * @return {String} A html string mapping to a wordle record on the landing page.
 */
inverted_wordles.manage.renderWordleRow = function (wordleOptions) {
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
            <a id="view-answer-id-${ uniqueId }" class="button view-answer" href="https://${ wordleOptions.branchName + inverted_wordles.instance.netlifyUrlSuffix }answer/">
                <svg role="presentation" class="view-answer-svg">
                    <use xlink:href="#view"></use>
                </svg>
                View
            </a>
        </div>
        <div class="view-wordle-cell">
            <label for="view-wordle-id-${ uniqueId }">Wordle</label>
            <a id="view-wordle-id-${ uniqueId }" class="button view-wordle" href="https://${ wordleOptions.branchName + inverted_wordles.instance.netlifyUrlSuffix }wordle/">
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
        <input type="hidden" name="deployStatus" value="${ wordleOptions.deployStatus }">
    </div>\n\n`;

    return htmlTogo;
};

/**
 * Find the wordle row on the wordle list based on the given branch name.
 * @param {String} wordlesAreaSelector - The wordles area selector.
 * @param {String} branchName - The branch name.
 * @return {DOMElement} The DOM element of a wordle row.
 */
inverted_wordles.manage.findWordleRowByBranchName = function (wordlesAreaSelector, branchName) {
    const wordlesListElm = document.querySelector(wordlesAreaSelector);
    // On the wordle list, find the row with the same branch name
    const branchNameElm = wordlesListElm.querySelector("input[value=\"" + branchName + "\"]");
    // Return the wordle row element
    return branchNameElm.parentElement;
};

/**
 * Compute the to-name that shares the same suffix with the from-name.
 * @param {String} nameFrom - The from-name composing of the from-prefix and the suffix.
 * @param {String} prefixFrom - The prefix of the from-name.
 * @param {String} prefixTo - The prefix of the to-name.
 * @return {String} The to-name that shares the same suffix with the from-name.
 */
inverted_wordles.manage.getNameWithSharedSuffix = function (nameFrom, prefixFrom, prefixTo) {
    return prefixTo + nameFrom.substring(prefixFrom.length);
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
inverted_wordles.manage.updateWordleRow = function (wordlesAreaSelector, wordleValues) {
    // Remove the existing wordle row for the given branch
    inverted_wordles.manage.findWordleRowByBranchName(wordlesAreaSelector, wordleValues.branchName).remove();

    // Get the html for the new row
    const newWordleRow = inverted_wordles.manage.renderWordleRow({
        branchName: wordleValues.branchName,
        workshopName: wordleValues.workshopName,
        question: wordleValues.question,
        entries: wordleValues.entries,
        lastModifiedTimestamp: wordleValues.lastModifiedTimestamp,
        deployStatus: wordleValues.deployStatus
    });

    // append the new row to the wordle list
    document.querySelector(wordlesAreaSelector).insertAdjacentHTML("beforeend", newWordleRow);
};

/**
 * Append the wordle row that is in the process of deploy to the wordle list.
 * @param {String} wordlesAreaSelector - The wordles area selector.
 * @param {WordleValues} wordleValues - Values to be rendered for this Wordle.
 */
inverted_wordles.manage.appendInDeployWordleRow = function (wordlesAreaSelector, wordleValues) {
    const newWordleRow = inverted_wordles.manage.renderWordleRow({
        branchName: wordleValues.branchName,
        workshopName: wordleValues.workshopName,
        question: wordleValues.question,
        entries: wordleValues.entries,
        lastModifiedTimestamp: wordleValues.lastModifiedTimestamp,
        deployStatus: wordleValues.deployStatus,
        statusMsg: "*Please wait until the question link is generated and webpage is created. This may take 30 seconds*",
        extraStatusClass: "info",
        extraRowClass: "grey-background",
        disableInputs: true,
        isCreateNew: true
    });

    // append the new row to the wordle list
    // Using insertAdjacentHTML() instead of innerHTML prevents the browser from re-evaluating the entire wordlesArea.
    // It helps to keep value changes and retain event listeners on other row elements.
    // See: https://stackoverflow.com/questions/38945032/append-htmltext-to-element-without-affecting-siblings
    document.querySelector(wordlesAreaSelector).insertAdjacentHTML("beforeend", newWordleRow);
};

/**
 * Bind the polling event to check if a branch deploy completes.
 * @param {WordleValues} wordleValues - Values to be rendered for this Wordle.
 * @param {Object} options - The value of inverted_wordles.manage.globalOptions.
 */
inverted_wordles.manage.bindDeploymentPolling = function (wordleValues, options) {
    // Disable "new question" button
    document.querySelector(options.selectors.createButton).disabled = true;

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
                        inverted_wordles.manage.updateWordleRow(options.selectors.wordlesArea, {
                            branchName: wordleValues.branchName,
                            workshopName: wordleValues.workshopName,
                            question: wordleValues.question,
                            entries: wordleValues.entries,
                            lastModifiedTimestamp: wordleValues.lastModifiedTimestamp
                        });

                        // Bind events for input elements and buttons on the new wordle row
                        const wordleRow = inverted_wordles.manage.findWordleRowByBranchName(options.selectors.wordlesArea, wordleValues.branchName);
                        inverted_wordles.manage.bindInputFieldEvents(wordleRow, options);
                        inverted_wordles.manage.bindDeleteEvents(wordleRow, options);

                        // Enable the "new question" button
                        document.querySelector(options.selectors.createButton).disabled = false;
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
