# Supported Netlify Endpoints

## Check Deploy State (POST /api/check_deploy)

* **description**: Check deploy states of one or more wordles.
* **method:** `POST`
* **route:** `/api/check_deploy` with these parameters in the `POST` body using the `application/json` Content-Type.
    * `branches`: An array of GitHub branch names.
```
{
    "branches": ["branch1", "branch2", ...]
}
```
* **return:** A JSON document containing the deploy state for every single branch. The deploy state is `true` when
a branch has been successfully deployed. Otherwise, the state is `false`.

```json
{
    "branch1": true,
    "branch2": false,
    ...
}
```

## Fetch Wordles (GET /api/fetch_wordles)

* **description**: Fetch the netlify site name and all wordles. The main branch is excluded from the wordle list.
* **method:** `GET`
* **route:** `/api/fetch_wordles`
* **return:** A JSON document containing all wordles.

```json
{
    "netlifySiteName": "inverted-wordles",
    "wordles": {
        "a11y-workshop": {
            "content": {
                "workshopName": "Accessibility Workshop",
                "question": "What are three most important problems to be addressed by inclusive design?",
                "entries": 3,
                "entryMaxLength": 80,
                "createdTimestamp": "2021-05-05T18:03:02.752Z",
                "lastModifiedTimestamp": "2021-05-05T18:03:02.752Z",
                "branch": "a11y-workshop"
            },
            "exists": true,
            "sha": "c150e89017167f06cbd0e809ed66fb070696e626"
        }
        ...
    }
}
```

## Fetch a Wordle Question (GET /api/fetch_question/:branchName)

* **description**: Fetch a wordle question.
* **method:** `GET`
* **route:** `/api/fetch_question/:branchName` where:
    * `branchName`: A branch name.
* **return:** A JSON document containing the question information of a wordle.

```json
{
    "workshopName": "Accessibility Workshop",
    "question": "What are three most important problems to be addressed by inclusive design?",
    "entries": 3,
    "entryMaxLength": 80,
    "createdTimestamp": "2021-05-05T18:03:02.752Z",
    "lastModifiedTimestamp": "2021-05-05T18:03:02.752Z",
    "branch": "a11y-workshop"
}
```

## Fetch Answers for a Wordle (GET /api/fetch_answer/:branchName)

* **description**: Fetch answers for a wordle.
* **method:** `GET`
* **route:** `/api/fetch_answer/:branchName` where:
    * `branchName`: A branch name.
* **return:** A JSON document containing answers.

```json
{
    "uuid": {
        "answers": ["answer1", "answer2", ...],
        "createdTimestamp": "2021-09-23T17:50:57.143Z"
    }
}
```

## Save a Wordle Question (POST /api/save_question)

* **description**: Save the question information for a wordle.
* **method:** `POST`
* **route:** `/api/save_question` with these parameters in the `POST` body using the `application/json` Content-Type.
    * `branch`: The branch name for a wordle.
    * `workshop-name`: Optional. The workshop name.
    * `question`: Optional. The wordle question.
    * `entries`: Optional. Number of answers allowed when answering this question.
* **return:** A JSON document containing the updated content of the question file.

```json
{
    "workshopName": "Accessibility Workshop",
    "question": "What are three most important problems to be addressed by inclusive design?",
    "entries": 3,
    "entryMaxLength": 80,
    "createdTimestamp": "2021-05-05T18:03:02.752Z",
    "lastModifiedTimestamp": "2021-05-05T18:03:02.752Z",
    "branch": "a11y-workshop"
}
```

## Save Answers for a Wordle (POST /api/save_answers)

* **description**: Fetch answers for a wordle. If the answer file for this wordle doesn't exist, create it. Otherwise,
update the answers file with new answers.
* **method:** `POST`
* **route:** `/api/save_answers` with these parameters in the `POST` body using the `application/json` Content-Type.
    * `branch`: The branch name for a wordle.
    * `requestId`: a string of a request id.
    * `answers`: an array containing answers
* **return:** A JSON document containing answers.

```json
{
    "branch": "a11y-workshop",
    "answers": ["answer1", "answer2", ...],
    "requestId": "w68g2o"
}
```

## Create a New Wordle (POST /api/create_branch)

* **description**: Check a new branch in the wordle GitHub repository.
* **method:** `POST`
* **route:** `/api/create_branch` with these parameters in the `POST` body using the `application/json` Content-Type.
    * `branchName`: A branch name.
```
{
    "branchName": "a-new-branch"
}
```
* **return:** A JSON document containing the branch name that has been created, along with a timestamp of when it's
created.

```json
{
    "branchName": "a-new-branch",
    "lastModifiedTimestamp": "2021-09-23T17:50:57.143Z"
}
```

## Delete a Wordle (DELETE /api/delete_wordle/:branchName)

* **description**: Delete a branch.
* **method:** `DELETE`
* **route:** `/api/delete_wordle/:branchName` where:
    * `branchName`: A branch name.
* **return:** A success message when a deletion completes successfully.

```json
"Deleted successfully!"
```
