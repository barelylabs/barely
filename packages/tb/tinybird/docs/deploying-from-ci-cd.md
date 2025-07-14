---
title: CI/CD
meta:
  description: Deploy your Tinybird project through CI/CD workflows.
---

# Deploying to Tinybird through CI/CD

After you create your data project in Git, you can implement continuous integration (CI) and continuous deployment (CD) workflows to automate interaction with Tinybird.

When you create a project using `tb create`, Tinybird generates CI/CD templates that you can use in GitHub and GitLab to automate testing and deployment.

The Tinybird Local container is a key part of the CI workflow. See [Local container](/forward/install-tinybird/local) for more information.

## CI workflow

As you expand and iterate on your data projects, you can continuously validate your changes. In the same way that you write integration and acceptance tests for source code in a software project, you can write automated tests for your API endpoints to run on each pull or merge request.

A potential CI workflow could run the following steps when you open a pull request:

1. Install Tinybird CLI and Tinybird Local: Sets up dependencies and installs the Tinybird CLI to run the required commands.
2. Build project: Checks the datafile syntax and correctness.
3. Test project: Runs fixture tests, data quality tests, or both to validate changes.
4. Deployment check: Validates the deployment before creating it, similar to a dry run.

The following templates are available for GitHub and GitLab:

{% tabs initial="GitHub" %}
{% tab label="GitHub"  %}

```yaml
name: Tinybird - CI Workflow

on:
  workflow_dispatch:
  pull_request:
    branches:
      - main
      - master
    types: [opened, reopened, labeled, unlabeled, synchronize]

concurrency: ${{ github.workflow }}-${{ github.event.pull_request.number }}

env:
  TINYBIRD_HOST: ${{ secrets.TINYBIRD_HOST }}
  TINYBIRD_TOKEN: ${{ secrets.TINYBIRD_TOKEN }}

jobs:
  ci:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: '.'
    services:
      tinybird:
        image: tinybirdco/tinybird-local:latest
        ports:
          - 7181:7181
    steps:
      - uses: actions/checkout@v3
      - name: Install Tinybird CLI
        run: curl https://tinybird.co | sh
      - name: Build project
        run: tb build
      - name: Test project
        run: tb test run
      - name: Deployment check
        run: tb --cloud --host ${{ env.TINYBIRD_HOST }} --token ${{ env.TINYBIRD_TOKEN }} deploy --check
```

{% /tab %}

{% tab label="GitLab"  %}

```yaml
tinybird_ci_workflow:
  image: ubuntu:latest
  stage: tests
  interruptible: true
  needs: []
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      changes:
        - .gitlab/tinybird/*
  before_script:
    - apt update && apt install -y curl
    - curl https://tinybird.co | sh
  script:
    - export PATH="$HOME/.local/bin:$PATH"
    - cd $CI_PROJECT_DIR/.
    - tb build
    - tb test run
    - tb --cloud --host ${{ TINYBIRD_HOST }} --token ${{ TINYBIRD_TOKEN }} deploy --check
  services:
    - name: tinybirdco/tinybird-local:latest
      alias: tinybird-local
```

{% /tab %}
{% /tabs %}

## CD workflow

Once your changes are validated by the CI pipeline, you can automate the deployment process and let Tinybird handle the migration for you with no downtime.

A potential CD workflow could run the following steps when you merge a pull request:

1. Install Tinybird CLI: Sets up dependencies and installs the Tinybird CLI to run the required commands.
2. Deploy project: Creates a staging deployment in Tinybird Cloud, migrates data, promotes to live, and removes previous deployment.

The following templates are available for GitHub and GitLab:

{% tabs initial="GitHub" %}
{% tab label="GitHub"  %}

```yaml
name: Tinybird - CD Workflow

on:
  push:
    branches:
      - main
      - master

concurrency: ${{ github.workflow }}-${{ github.event.ref }}

env:
  TINYBIRD_HOST: ${{ secrets.TINYBIRD_HOST }}
  TINYBIRD_TOKEN: ${{ secrets.TINYBIRD_TOKEN }}

jobs:
  cd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Tinybird CLI
        run: curl https://tinybird.co | sh
      - name: Deploy project
        run: tb --cloud --host ${{ env.TINYBIRD_HOST }} --token ${{ env.TINYBIRD_TOKEN }} deploy
```

{% /tab %}

{% tab label="GitLab"  %}

```yaml
tinybird_cd_workflow:
  image: ubuntu:latest
  stage: deploy
  resource_group: production
  needs: []
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      changes:
        - .gitlab/tinybird/*
  script:
    - export PATH="$HOME/.local/bin:$PATH"
    - cd $CI_PROJECT_DIR/.
    - tb --cloud --host ${{ TINYBIRD_HOST }} --token ${{ TINYBIRD_TOKEN }} deploy
```

{% /tab %}
{% /tabs %}

## Secrets

Make sure to provide the values for the following secrets in your CI/CD settings:

- `TINYBIRD_HOST`
- `TINYBIRD_TOKEN`

Run `tb info` to get the value for the secret `TINYBIRD_HOST`. It is **api** url in Tinybird Cloud. For example:

```bash
tb info

» Tinybird Cloud:
--------------------------------------------------------------------------------------------
user: tinybird@domain.co
workspace_name: forward
workspace_id: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX
token: YOUR-ADMIN-TOKEN
user_token: YOUR-USER-TOKEN
api: https://api.tinybird.co
ui: https://cloud.tinybird.co/gcp/europe-west2/forward
--------------------------------------------------------------------------------------------

» Tinybird Local:
--------------------------------------------------------------------------------------------
user: tinybird@domain.co
workspace_name: forward
workspace_id: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX
token: YOUR-LOCAL-ADMIN-TOKEN
user_token: YOUR-LOCAL-USER-TOKEN
api: http://localhost:7181
ui: http://cloud.tinybird.co/local/7181/forward
--------------------------------------------------------------------------------------------

» Project:
---------------------------------------------------
current: /path/to/your/project
.tinyb: /path/to/your/project/.tinyb
project: /path/to/your/project
---------------------------------------------------
```

And run `tb --cloud token copy "admin <your_email>"` to get the value of `TINYBIRD_TOKEN`.

```bash
tb --cloud token copy "admin your_user@email.com"
Running against Tinybird Cloud: Workspace forward
** Token 'admin your_user@email.com' copied to clipboard
```

When running `tb test run`, Tinybird creates a fresh workspace for each test run. Secrets will not persist between test runs. To avoid test failures, add a default value to your secrets. For example:

```bash
GCS_SERVICE_ACCOUNT_CREDENTIALS_JSON {{ tb_secret("secret_name", "default_value") }}
```

{% callout type="info" %}
`tb_secrets` replacements happen at parser time in the server. If a secret is changed after a deployment is done, Tinybird won’t detect it automatically and will require an extra deployment.
{% /callout %}

## Next steps

- Learn more about [deployments](/forward/test-and-deploy/deployments).
- Learn about the [Local container](/forward/install-tinybird/local).
- Learn about datafiles, like .datasource and .pipe files. See [Datafiles](/forward/dev-reference/datafiles).
- Browse the Tinybird CLI commands reference. See [Commands reference](/forward/dev-reference/commands).
