![Build](https://github.com/roderik/unfurl-dropbox-screenshots/workflows/Build/badge.svg)

# Unfurl Dropbox screenshot links

I make a lot of issues in my daily job, and often they contain screenshots. 
Dropbox captures them and upload them to my dropbox account, putting a link to the
screenshot in my clipboard which I then paste into an issue.

But this is really annoying for the people handling the issues since it takes another
click to see the screenshot. And while Github does some unfurling, the links are not unfurled.

So this action which you run on issue and comment creation will do so for you.

## Inputs

### `repo-token`

**Required** A GitHub access token with access to issues, ${{ secrets.GITHUB_TOKEN }} will do.

## Example usage

```yaml
name: Issue

on:
  issue_comment:
    types: [created, edited]
  issues:
    types: [opened, edited]

jobs:
  unfurl:
    runs-on: ubuntu-latest
    name: Unfurl all Dropbox screenshot links
    steps:
      - name: Unfurl
        uses: roderik/unfurl-dropbox-screenshots@v2
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
