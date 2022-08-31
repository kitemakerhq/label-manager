# label-manager

A simple utility that uses the Kitemaker API to manage labels in your spaces

## Usage

Use the `list-all` script to find all of your spaces and which labels they have

```bash
yarn
export KITEMAKER_TOKEN=<your-kitemaker-api-token>
yarn list-all
```

Use the `swap` script to replace a particular label with another one

Options:

- `--space`: The space whose work items the script will iterate over
- `--to-replace`: The label to remove from any work items that currently contain it
- `--replace-with` The label to replace the aforementioned label with

```bash
yarn
export KITEMAKER_TOKEN=<your-kitemaker-api-token>
yarn swap --space=0687e24ab416b000 --to-replace=1161ff8edca20000 --replace-with=0687e27c45a6b000
```

Use the `create-labels` script to create a set of labels across all spaces in an organization

Options:

- `--labels`: A comma-separated list of labels to create (e.g. -l Bug,Feature). If you wish to specify the color, separate it from the name with a ':' (e.g. -l Bug:FF000)
- `--omit-spaces`: A list of space names or keys in which you should not create the labels
- `--dry-run`: Print which labels the script would create but don't actually create them

```bash
yarn
export KITEMAKER_TOKEN=<your-kitemaker-api-token>
yarn create-labels --omit-spaces=Marketing,HR -l Bug:ff0000,Feature:00ff00
```
