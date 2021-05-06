"use strict";

// Submit the form data on the answer page to the server
document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    let dataTogo = {
        answers: [],
        branch: document.querySelectorAll("input[name='branch']")[0].value
    };

    // Find all answer values
    const answerElms = document.querySelectorAll("input[name='answer']");
    for (let i = 0; i < answerElms.length; i++) {
        let currentAnswer = answerElms[i].value;
        if (currentAnswer.trim() !== "") {
            dataTogo.answers.push(currentAnswer);
        }
    }

    // Submit the data to the server
    fetch("/api/save_answers", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataTogo)
    }).then(response => {
        const statusElm = document.getElementById("submit_status");
        statusElm.className = response.ok ? "green" : "red";
        statusElm.innerHTML = response.ok ? "Your answer has been submitted successfully." : "There is a problem submitting your answer. Please try again later.";
    });
});
