"use strict";

/* global netlifyIdentity, inverted_wordles */
inverted_wordles.instance = {};

/**
 * Check if a netlify user is logged in at the page load.
 */
document.addEventListener("DOMContentLoaded", () => {
    inverted_wordles.instance.user = netlifyIdentity.currentUser();
});

inverted_wordles.manage.setLoginState = function (isLoggedIn, options) {
    const deployStatusElements = document.querySelectorAll("input[name='" + options.deployStatusField + "']");
    for (let i = 0; i < deployStatusElements.length; i++) {
        const currentDeployStatus = deployStatusElements[i].value;
        const enabled = isLoggedIn && currentDeployStatus === options.deployStatus.ready;

        // For wordles that have been deployed, enable their input fields and delete button. Otherwise, disable them.
        const parentContainer = deployStatusElements[i].parentElement;
        const inputElements = parentContainer.getElementsByTagName("input");
        for (let i = 0; i < inputElements.length; i++) {
            if (options.inputFieldNames.includes(inputElements[i].getAttribute("name"))) {
                if (enabled) {
                    inputElements[i].removeAttribute("disabled");
                } else {
                    inputElements[i].setAttribute("disabled", "disabled");
                }
            }
        }

        parentContainer.querySelector(options.selectors.deleteButton).disabled = enabled ? false : true;
    }

    // Show or hide create new question button
    document.querySelector(options.selectors.createButton).style.display = isLoggedIn ? "block" : "none";
};

/**
 * Bind netlify events to respond to user login and logout.
 * @param {Object} options - The value of inverted_wordles.manage.globalOptions.
 */
inverted_wordles.manage.bindNetlifyEvents = function (options) {
    netlifyIdentity.on("login", () => inverted_wordles.manage.setLoginState(true, options));
    netlifyIdentity.on("logout", () => inverted_wordles.manage.setLoginState(false, options));
};
