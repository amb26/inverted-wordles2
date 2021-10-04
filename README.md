# Inverted Wordles

This project allows users to create word cloud questions. Answers to each question will be gathered to build an
inverted Wordle that highlights minority answers.

The front end of the project is built with [Eleventy](https://11ty.dev/). The website is deployed on
[Netlify](https://www.netlify.com/). The wordle data is saved in [the inclusive-design/inverted-wordles GitHub
repository](https://github.com/inclusive-design/inverted-wordles/).

When a new wordle question is created or an existing wordle question is modified, the new/updated question is pushed
into the GitHub repository that triggers Netlify to deploy/re-deploy the wordle website. The detail of the architecture
of this project can be found at [Inverted Wordles Architecture wiki page](https://wiki.fluidproject.org/display/fluid/Inverted+Wordles+Architecture).

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

To test the project in a self-contained way, follow steps below to deploy a personal cloned `inverted-wordles`
GitHub repository with Netlify.

* Sign up with [Netlify](https://netlify.com/)
* Follow [the Netlify documentation](https://docs.netlify.com/site-deploys/create-deploys/#deploy-with-git) to connect
a GitHub repository with a Netlify site
* Go to Netlify "Site settings" -> "Build & deploy" section
    * In "Branches" -> set "Branch deploys" to "All" (Deploy all the branches pushed to the repository)
    * In "Environment" -> add environment variables. See "Environment Variables" section below to find out
    what variables need to be defined
* Go to Netlify Identity, enable identity service then invite yourself and others who will use your inverted-wordles
site.

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

* REPOSITORY_URL: Optional. The GitHub repository URL that wordles are operated on. For example:
`https://github.com/inclusive-design/inverted-wordles`. This variable needs to be manually defined when running
the project locally via `netlify dev`. With real Netlify deployed sites, it is automatically available as a Netlify
build time environment variable. See [the Netlify build environment variables documentation](github.com/cindyli/inverted-wordles).
* GITHUB_TOKEN: The personal access token of the account for authenticating the access to the Github repository. This
access token must have `repo` access. Refer to [the Github documentation](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)
about how to create a personal access token.
* NETLIFY_TOKEN: The personal access token of the Netlify account for authenticating the access to the Netlify API.
Refer to [the Netlify documentation](https://docs.netlify.com/api/get-started/#authentication) about how to create
a personal access token.

#### Run with Local Netlify Endpoints

Follow [Netlify instructions](https://docs.netlify.com/functions/build-with-javascript/#tools) to install tools for testing
and deploying Netlify functions locally. Once the tool is set up, run:

```bash
export REPOSITORY_URL=YOUR-REPOSITORY-URL
export GITHUB_TOKEN=YOUR-PERSONAL-ACCESS-TOKEN
export NETLIFY_TOKEN=YOUR-NETLIFY-ACCOUNT-PERSONAL-ACCESS-TOKEN
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
REPOSITORY_URL=YOUR-REPOSITORY-URL
GITHUB_TOKEN=YOUR-PERSONAL-ACCESS-TOKEN
NETLIFY_TOKEN=YOUR-NETLIFY-ACCOUNT-PERSONAL-ACCESS-TOKEN
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
