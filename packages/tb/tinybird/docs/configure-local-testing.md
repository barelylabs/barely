---
title: Configure local testing
meta:
  description: Set up fixtures and test suites for your Tinybird project.
---

# Configure local testing

Testing your data project locally ensures that your resources are working as expected before you deploy your project to Tinybird.

There are several ways of generating test data for your local project. You can:

- Check the deployment before creating it. See [Check deployment](#check-deployment).
- Create fixtures and store them with your datafiles. See [Fixture files](#fixture-files).
- Generate mock data using the `tb mock` command. See [Generate mock data](#generate-mock-data).
- Use Tinybird's ingest APIs to send events or files. See [Call the ingest APIs](#call-the-ingest-apis).
- Generate test suites using the `tb test` command. See [Create a test suite](#create-a-test-suite).

## Check deployment

After you finish developing your project, run `tb deploy --check` to validate the deployment before creating it. This is a good way of catching potential breaking changes. See [tb deploy](/forward/dev-reference/commands/tb-deploy) for more information.

```shell
tb deploy --check
Running against Tinybird Local

» Validating deployment...

» Changes to be deployed...

-----------------------------------------------------------------
| status   | name         | path                                |
-----------------------------------------------------------------
| modified | user_actions | datasources/user_actions.datasource |
-----------------------------------------------------------------

✓ Deployment is valid
```

## Fixture files

Fixtures are NDJSON files that contain sample data for your project. Fixtures are stored inside the `fixtures` folder in your project.

```text
my-app/
├─ datasources/
│  ├─ user_actions.datasource
│  └─ ...
├─ fixtures/
│  ├─ user_actions.ndjson
│  └─ ...
```

Every time you run `tb build`, the CLI checks for fixture files and includes them in the build. Fixture files must have the same name as the associated .datasource file.

## Generate mock data

The `tb mock` command creates fixtures based on your data sources. See [tb mock](/forward/dev-reference/commands/tb-mock) for more information.

For example, the following command creates a fixture for the `user_actions` data source.

```shell
tb mock user_actions

» Creating fixture for user_actions...
✓ /fixtures/user_actions.ndjson created
...
```

You can use the `--prompt` flag to add more context to the data that is generated. For example:

```shell
tb mock user_actions --prompt "Create mock data for 23 users from the US"`
```

## Call the ingest APIs

Another way of testing your project is to call the local ingest APIs:

- Send events to the local [Events API](/api-reference/events-api) using a generator.
- Ingest data from files using the [Data sources API](/api-reference/datasource-api).

Obtain a token using `tb token ls` and call the local endpoint:

{% tabs initial="cURL (Events API)" %}

{% tab label="cURL (Events API)" %}

```shell
curl \
      -X POST 'http://localhost:7181/v0/events?name=<your_datasource>' \
      -H "Authorization: Bearer <your_token>" \
      -d $'<your_data>'
```

{% /tab %}

{% tab label="Local file (Data sources API)" %}

```shell
curl \
-H "Authorization: Bearer <your-token>" \
-X POST "http://localhost:7181/v0/datasources?mode=append&name=<your_datasource>" \
-F csv=@local_file.csv
```

{% /tab %}

{% tab label="Remote file (Data sources API)" %}

```shell
curl \
-H "Authorization: Bearer <your-token>" \
-X POST "http://localhost:7181/v0/datasources?mode=append&name=<your_datasource>" \
-d url='<https://s3.amazonaws.com/remote_file.csv>'
```

{% /tab %}

{% /tabs %}

As you call the APIs, you can see errors and warnings in the console. Use this information to debug your datafiles.

## Create a test suite

Once your project builds correctly, you can generate a test suite using [tb test](/forward/dev-reference/commands/tb-test).

For example, the following command creates a test suite for the `user_action_insights_widget` pipe.

```shell
# Pass a pipe name to create a test
tb test create user_action_insights_widget
```

Then, customize the tests to fit your needs.

You can use the `--prompt` flag to add more context to the data that is generated. For example:

```shell
tb test create user_action_insights_widget --prompt "return user actions filtering by CLICKED"
```

The output of the command is a test suite file that you can find in the `tests` folder of your project.

```yaml
- name: user_action_insights_widget_clicked
  description: Test the endpoint that returns user actions filtering by CLICKED
  parameters: action=CLICKED
  expected_result: |
    {"action":"CLICKED", "user_id":1, "timestamp":"2025-03-19T01:58:31Z"}
    {"action":"CLICKED", "user_id":2, "timestamp":"2025-03-20T05:34:22Z"}
    {"action":"CLICKED", "user_id":3, "timestamp":"2025-03-21T19:21:34Z"}
```

When creating tests, follow these guidelines:

- Give each test a meaningful name and description that explains its purpose.
- Define query parameters without quotes.
- The `expected_result` should match the data object from your endpoint's response.
- An empty string (`''`) in the `expected_result` means the endpoint returns no data. If an empty result is unexpected, verify your endpoint's output and update the test by running:

```shell
tb test update user_action_insights_widget
```

Once you have your test suite, you can run it using the `tb test run` command.

```shell
tb test run

» Running tests

* user_action_insights_widget_clicked.yaml
✓ user_action_insights_widget_clicked passed

✓ 1/1 passed
```

## Next steps

- Make changes to your data sources and test them. See [Evolve data sources](/forward/test-and-deploy/evolve-data-source).
- Learn more about [deployments](/forward/test-and-deploy/deployments).
- Learn about datafiles, like .datasource and .pipe files. See [Datafiles](/forward/dev-reference/datafiles).
