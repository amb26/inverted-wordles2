"use strict";

/* global globalOptions, inverted_wordles */

// Bind necessary events
inverted_wordles.initPage = function (response) {
    inverted_wordles.bindNetlifyEvents(globalOptions);
    response.json().then(wordles => {
        inverted_wordles.listWordles(wordles, globalOptions.selectors.wordlesArea);
        // globalOptions.user is set in login_handler.js
        inverted_wordles.setLoginState(globalOptions.user ? true : false);
        inverted_wordles.bindCreateEvent();
        inverted_wordles.bindInputFieldEvents(document);
        inverted_wordles.bindDeleteEvents(document);
    });
};

inverted_wordles.initWordles = function () {
    fetch("/api/fetch_wordles").then(
        response => inverted_wordles.initPage(response),
        error => inverted_wordles.reportStatus("Error at listing all wordles: " + error, document.querySelector(globalOptions.selectors.status), true)
    );
};
