---
title: Tinybird Local container
meta:
  description: Use the Tinybird Local container to run Tinybird locally and in CI workflows.
---

# Tinybird Local container

You can run your own Tinybird instance locally using the `tinybird-local` container.

The Tinybird Local container is useful in CI/CD pipelines. See [CI/CD](/forward/test-and-deploy/deployments/cicd) for more information. You can also deploy it on your own cloud infrastructure.

## Prerequisites

To get started, you need a container runtime, like Docker or orbstack.

## Run the Tinybird Local container

To run Tinybird locally, run the following command:

```bash
docker run --platform linux/amd64 -p 7181:7181 --name tinybird-local -d tinybirdco/tinybird-local:latest
```

By default, Tinybird Local runs on port 7181, although you can expose it locally using any other port.

## API endpoints

By default, the Tinybird Local container exposes the following API endpoint:

- `http://localhost:7181/api/v0/`

You can call all the existing [Tinybird API endpoints](/api-reference) locally. For example:

````bash
```shell
curl \
      -X POST 'http://localhost:7181/v0/events?name=<your_datasource>' \
      -H "Authorization: Bearer <your_token>" \
      -d $'<your_data>'
````

## Persist data between sessions

To persist your data between development sessions, you can specify a custom path for storing your data volumes with the `--volumes-path` flag:

```bash
tb local start --volumes-path <your/path>
```

This ensures your data persists between restarts, making local development more efficient and reliable.

{% callout level="tip" %}
Remember that `tb local stop` does not remove the data. `tb local restart` does, so to get to an earlier state you can do `tb local restart --volumes-path ./tb_previous_snapshot`
{% /callout %}

## Next steps

- Learn about datafiles. See [Datafiles](/forward/dev-reference/datafiles).
- Learn about the Tinybird CLI. See [Command reference](/forward/dev-reference/commands).
