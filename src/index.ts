import * as core from '@actions/core';
import * as github from '@actions/github';
import { URL } from 'url';

async function run(): Promise<void> {
  try {
    const args = getArgs();
    const client = new github.GitHub(args.repoToken);
    await processIssues(client);

    // `who-to-greet` input defined in action metadata file
    // const nameToGreet = core.getInput('who-to-greet');
    // console.log(`Hello ${nameToGreet}!`);
    // const time = new Date().toTimeString();
    // core.setOutput('time', time);
    // // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.error(error.toString());
    core.setFailed(error.message);
  }
}

async function processIssues(client: github.GitHub): Promise<void> {
  const issues = await client.issues.listForRepo({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    state: 'open',
  });

  for (const issue of issues.data.values()) {
    core.debug(`found issue: ${issue.title} last updated ${issue.updated_at}`);

    const replacedBody = urlReplace(issue.body);
    if (issue.body !== replacedBody) {
      await client.issues.update({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        issue_number: issue.number,
        body: imageReplace(urlReplace(issue.body)),
      });
    }
  }
}

function urlReplace(text: string): string {
  const urlRegex = /((?<!\+)(?:https?(?::\/\/))(?:www\.)?(?:[a-zA-Z\d-_.]+(?:(?:\.|@)[a-zA-Z\d]{2,})|localhost)(?:(?:[-a-zA-Z\d:%_+.~#!?&//=@]*)(?:[,](?![\s]))*)*)/g;

  return text.replace(urlRegex, (url) => {
    const parsedURL = new URL(url);
    if (parsedURL.hostname.includes('dropbox.com')) {
      parsedURL.search = 'raw=1';

      return parsedURL.toString();
    }

    return url;
  });
}

function imageReplace(text: string): string {
  const urlRegex = /((?<!\+)( |\n)(?:https?(?::\/\/))(?:www\.)?(?:[a-zA-Z\d-_.]+(?:(?:\.|@)[a-zA-Z\d]{2,})|localhost)(?:(?:[-a-zA-Z\d:%_+.~#!?&//=@]*)(?:[,](?![\s]))*)*)/g;

  return text.replace(urlRegex, (url) => {
    const trimmedUrl = url.trim();
    const parsedURL = new URL(trimmedUrl);
    if (parsedURL.hostname.includes('dropbox.com')) {
      if (trimmedUrl.includes('.png') || trimmedUrl.includes('.gif') || trimmedUrl.includes('.jpg')) {
        return `\n![](${trimmedUrl})`;
      }
    }
    return `\n${url}`;
  });
}

type Args = {
  repoToken: string;
};

function getArgs(): Args {
  return {
    repoToken: core.getInput('repo-token', { required: true }),
  };
}

run().catch((error) => {
  core.error(error);
  core.setFailed(error.message);
});
