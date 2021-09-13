"use strict";

/* global globalOptions, inverted_wordles, openDialog, closeDialog */

// Bind events for delete buttons
inverted_wordles.bindDeleteEvents = function (containerElm) {
    const delButtons = containerElm.querySelectorAll(globalOptions.selectors.deleteButton);
    for (let i = 0; i < delButtons.length; i++) {
        const currentButton = delButtons[i];
        // Open the delete confirmation dialog
        currentButton.addEventListener("click", evt => {
            openDialog(globalOptions.deleteDialogId, evt.target.id, globalOptions.deleteCancelId);
            const deleteDialog = document.getElementById(globalOptions.deleteDialogId);
            // set the aria-controls attribute to the id of the wordle row that will be deleted
            const uniqueIdSuffix = evt.target.id.substring(globalOptions.length);
            deleteDialog.querySelector(globalOptions.selectors.deleteConfirm).setAttribute("aria-controls", globalOptions.wordleRowIdPrefix + uniqueIdSuffix);
            // set the branch name to the delete confirmation dialog for the future retrival when the deletion is confirmed
            deleteDialog.querySelector("input[name='" + globalOptions.branchNameField + "']").value = currentButton.parentElement.parentElement.querySelector("input[name='" + globalOptions.branchNameField + "']").value;
        });
    };
};

window.deleteWordle = function (closeButton) {
    // find out the branch to be deleted
    const branchName = closeButton.parentElement.querySelector("input[name='" + globalOptions.branchNameField + "']").value;
    // close the confirmation dialog
    closeDialog(closeButton);
    // Find the row with the current branch name
    const rowElm = inverted_wordles.findWordleRowByBranchName(branchName);
    // Find the status element for reporting errors when occuring
    const oneStatusElm = rowElm.querySelector(globalOptions.selectors.oneStatus);

    // delete the branch
    fetch("/api/delete_wordle/" + branchName, {
        method: "DELETE"
    }).then(response => {
        // Javascript fetch function does not reject when the status code is between 400 to 600.
        // This range of status code needs to be handled specifically in the success block.
        // See https://github.com/whatwg/fetch/issues/18
        if (response.status >= 400 && response.status < 600) {
            response.json().then(res => {
                inverted_wordles.reportStatus("*FAILED: Sorry the question failed to delete. Error: " + res.error + "*", oneStatusElm, true);
            });
        } else {
            // Remove the wordle from the wordle list
            rowElm.remove();
        }
    }, error => {
        error.json().then(err => {
            inverted_wordles.reportStatus("*FAILED: Sorry the question failed to delete. Error: " + err.error + "*", oneStatusElm, true);
        });
    });
};
