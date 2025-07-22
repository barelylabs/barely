---
title: Test and deploy
meta:
  description: Test and deploy your Tinybird project. Make changes and deploy to Tinybird Cloud.
---

# Test and deploy your project

After you've created your project, you can iterate on it, test it locally, and deploy it to Tinybird Cloud.

Tinybird makes it easy to iterate, test, and deploy your data project like any other software project.

## Development lifecycle

The following steps describe the typical development lifecycle.

{% steps %}

### Develop locally

Create the project using the Tinybird CLI. See [tb create](/forward/dev-reference/commands/tb-create).

Start a dev session to build your project and watch for changes as you edit the [datafiles](/forward/dev-reference/datafiles). See [tb dev](/forward/dev-reference/commands/tb-dev). For example, you might need to optimize an endpoint, add a new endpoint, or change the data type of a column.

If you make schema changes that are incompatible with the previous version, you must use a [forward query](/forward/test-and-deploy/evolve-data-source#forward-query) in your .datasource file. Otherwise, your deployment will fail due to a schema mismatch. See [Evolve data sources](/forward/test-and-deploy/evolve-data-source).

### Validate and test

With a set of datafiles, you need to test your project to ensure it behaves as expected.

There are several ways to validate and test your changes. See [Test your project](/forward/test-and-deploy/test-your-project).

### Stage your changes

After you've built and tested your project, you can create a staging deployment locally or in Tinybird Cloud. See [Deployments](/forward/test-and-deploy/deployments).

You can run commands against the staging deployment using the `--staging` flag.

### Promote your changes

After successfully creating your staging deployment, promote it to live to make the changes available to your users. See [tb deployment promote](/forward/dev-reference/commands/tb-deployment#tb-deployment-promote).

{% callout type="info" %}
Tinybird only supports one live and one staging deployment per workspace.
{% /callout %}

{% /steps %}

## Next steps

- Make changes to your data sources and test them. See [Evolve data sources](/forward/test-and-deploy/evolve-data-source).
- Test your project locally. See [Test your project](/forward/test-and-deploy/test-your-project).
- Learn more about [deployments](/forward/test-and-deploy/deployments).
- Learn about datafiles, like .datasource and .pipe files. See [Datafiles](/forward/dev-reference/datafiles).
