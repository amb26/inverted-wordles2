"use strict";

/* global netlifyIdentity, globalOptions, inverted_wordles */

inverted_wordles.setLoginState = function (isLoggedIn, deleteButton, createButton, inputFieldNames) {
    // disable all input elements
    const inputElements = document.getElementsByTagName("input");
    for (let i = 0; i < inputElements.length; i++) {
        if (inputFieldNames.includes(inputElements[i].getAttribute("name"))) {
            if (isLoggedIn) {
                inputElements[i].removeAttribute("disabled");
            } else {
                inputElements[i].setAttribute("disabled", "disabled");
            }
        }
    }

    // disable delete buttons
    const deleteButtons = document.querySelectorAll(deleteButton);
    for (let i = 0; i < deleteButtons.length; i++) {
        deleteButtons[i].disabled = isLoggedIn ? false : true;
    }

    // hide create new question button
    document.querySelector(createButton).style.visibility = isLoggedIn ? "visible" : "hidden";
};

inverted_wordles.bindNetlifyEvents = function () {
    netlifyIdentity.on("login", () => inverted_wordles.setLoginState(true, globalOptions.selectors.deleteButton, globalOptions.selectors.createButton, globalOptions.inputFieldNames));
    netlifyIdentity.on("logout", () => inverted_wordles.setLoginState(false, globalOptions.selectors.deleteButton, globalOptions.selectors.createButton, globalOptions.inputFieldNames));
};