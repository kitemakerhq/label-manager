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
