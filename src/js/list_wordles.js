"use strict";

/* global inverted_wordles */

inverted_wordles.listWordles = function (wordles, wordlesAreaSelector) {
    let wordlesHtml = document.querySelector(wordlesAreaSelector).innerHTML;
    for (const [branchName, questionFile] of Object.entries(wordles)) {
        const workshopName = questionFile.exists && questionFile.content.workshopName ? inverted_wordles.escapeHtml(questionFile.content.workshopName) : "";
        const question = questionFile.exists && questionFile.content.question ? inverted_wordles.escapeHtml(questionFile.content.question) : "";
        const entries = questionFile.exists && questionFile.content.entries ? questionFile.content.entries : "";
        const lastModifiedTimestamp = questionFile.exists && questionFile.content.lastModifiedTimestamp ? questionFile.content.lastModifiedTimestamp.substring(0, 10).replace(/-/g, "/") : "";
        wordlesHtml += inverted_wordles.getWordleRow({
            branchName,
            workshopName,
            question,
            entries,
            lastModifiedTimestamp,
            disableInputs: false,
            isCreateNew: false
        });
    }
    document.querySelector(wordlesAreaSelector).innerHTML = wordlesHtml;
};
