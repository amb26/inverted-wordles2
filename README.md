# Inverted Wordles

This project allows users to create word cloud questions. Answers to each question will be gathered to build an
inverted Wordle that highlights minority answers.

The front end of the project is built with [Eleventy](https://11ty.dev/). The website is deployed on
[Netlify](https://www.netlify.com/).

## Install

To work on the project, you need to install [NodeJS and NPM](https://nodejs.org/en/download/) for your operating
system.

Then, clone the project from GitHub. [Create a fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo)
with your GitHub account, then enter the following in your command line (make sure to replace `your-username` with your username):

```bash
git clone https://github.com/your-username/inverted-wordles
```

From the root of the cloned project, enter the following in your command line to install dependencies:

```bash
npm ci
```

## Development

### Development without Netlify endpoints

When working on webpages that don't need the support of Netlify endpoints, run:

```bash
npm run dev
```

The website will be available at http://localhost:3000

### Development with Netlify endpoints

#### Environment Variables

This project uses individual Github branch to save the question and answers for each wordle case. The required
information for accessing the Github repository are defined in these environment variables:

* WORDLES_REPO_OWNER: The owner of the Github repository that the wordle data is saved into.
* WORDLES_REPO_NAME: The name of the Github repository that the wordle data is saved into.
* ACCESS_TOKEN: The personal access token of the account for authenticating the access to the Github repository. This
access token must have `repo` access. Refer to [the Github documentation](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)
about how to create a personal access token.

An example for finding out `WORDLES_REPO_OWNER` and `WORDLES_REPO_NAME` values: if the URL of a Github repository is
`https://github.com/inclusive-design/inverted-wordles`, the value of `WORDLES_REPO_OWNER` is `inclusive-design` and the
value of `WORDLES_REPO_NAME` is `inverted-wordles`.

#### Run with Local Netlify Endpoints

Follow [Netlify instructions](https://docs.netlify.com/functions/build-with-javascript/#tools) to install tools for testing
and deploying Netlify functions locally. Once the tool is set up, run:

```bash
export WORDLES_REPO_OWNER=YOUR-WORDLES_REPO_OWNER
export WORDLES_REPO_NAME=YOUR-WORDLES_REPO_NAME
export ACCESS_TOKEN=YOUR-PERSONAL-ACCESS-TOKEN
netlify dev
```

Look for this box in your console output:

```bash
   ┌──────────────────────────────────────────────────┐
   │                                                  │
   │   * Server now ready on http://localhost:64939   │
   │                                                  │
   └──────────────────────────────────────────────────┘
```

The website will be available at [http://localhost:64939](http://localhost:64939).

Alternatively, a `.env` file can be created within the local project directory and
environment variables can be added directly to it as follows:

```env
WORDLES_REPO_OWNER=YOUR-WORDLES_REPO_OWNER
WORDLES_REPO_NAME=YOUR-WORDLES_REPO_NAME
ACCESS_TOKEN=YOUR-PERSONAL-ACCESS-TOKEN
```

(Note: `.env` is in the project's `.gitignore` file to prevent sensitive information from being accidentally
committed to git.)

If a `.env` file is used, the local development server can be started with the following command:

```bash
netlify dev
```

### Lint

To lint the source code, run:

```bash
npm run lint
```
