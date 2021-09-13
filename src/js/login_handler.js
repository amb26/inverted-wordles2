"use strict";

/* global netlifyIdentity, globalOptions, inverted_wordles */

document.addEventListener("DOMContentLoaded", () => {
    globalOptions.user = netlifyIdentity.currentUser();
});

inverted_wordles.setLoginState = function (isLoggedIn) {
    // Enable or disable all input elements
    const inputElements = document.getElementsByTagName("input");
    for (let i = 0; i < inputElements.length; i++) {
        if (globalOptions.inputFieldNames.includes(inputElements[i].getAttribute("name"))) {
            if (isLoggedIn) {
                inputElements[i].removeAttribute("disabled");
            } else {
                inputElements[i].setAttribute("disabled", "disabled");
            }
        }
    }

    // Enable or disable delete buttons
    const deleteButtons = document.querySelectorAll(globalOptions.selectors.deleteButton);
    for (let i = 0; i < deleteButtons.length; i++) {
        deleteButtons[i].disabled = isLoggedIn ? false : true;
    }

    // Show or hide create new question button
    document.querySelector(globalOptions.selectors.createButton).style.display = isLoggedIn ? "block" : "none";
};

inverted_wordles.bindNetlifyEvents = function () {
    netlifyIdentity.on("login", () => inverted_wordles.setLoginState(true));
    netlifyIdentity.on("logout", () => inverted_wordles.setLoginState(false));
};
