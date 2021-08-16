import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import commandLineArgs from 'command-line-args';
import 'cross-fetch/polyfill';
import { addLabelsMutation } from './mutations/addLabels';
import { removeLabelsMutation } from './mutations/removeLabels';
import { workItemsQuery } from './queries/workItems';

if (!process.env.KITEMAKER_TOKEN) {
  console.error(
    'Could not find Kitemaker token. Make sure the KITEMAKER_TOKEN environment variable is set.'
  );
  process.exit(-1);
}

const host = process.env.KITEMAKER_HOST ?? 'https://toil.kitemaker.co';

const opts = commandLineArgs([
  { name: 'space', alias: 's', type: String },
  { name: 'to-replace', alias: 't', type: String },
  { name: 'replace-with', alias: 'w', type: String },
]);

if (!opts.space || !opts['to-replace'] || !opts['replace-with']) {
  console.error(
    'Please provide the space (-s) the label to replace (-t) and the label to replace it with (-w)'
  );
  process.exit(-1);
}

const httpLink = new HttpLink({
  uri: `${host}/developers/graphql`,
});
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${process.env.KITEMAKER_TOKEN}`,
    },
  };
});

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: { __schema: { types: [] } },
});
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({ fragmentMatcher }),
});

async function fetchWorkItems(space: string): Promise<any[]> {
  const workItems: any[] = [];
  let hasMore = true;
  let cursor: string | null = null;

  while (hasMore) {
    const result: any = await client.query({
      query: workItemsQuery,
      variables: {
        space,
        cursor,
      },
    });

    if (result.errors) {
      console.error('Unable to dump work items', JSON.stringify(result.errors, null, '  '));
      process.exit(-1);
    }

    cursor = result.data.workItems.cursor;
    hasMore = result.data.workItems.hasMore;
    for (const workItem of result.data.workItems.workItems) {
      workItems.push(workItem);
    }
  }

  return workItems;
}

async function swap() {
  try {
    const { ['replace-with']: replaceWith, ['to-replace']: toReplace, space } = opts;
    const workItems = await fetchWorkItems(space);
    for (const workItem of workItems) {
      const labels: string[] = workItem.labels.map((label: any) => label.id);
      if (!labels.includes(toReplace)) {
        continue;
      }

      // add the replacement if needed
      if (!labels.includes(replaceWith)) {
        await client.mutate({
          mutation: addLabelsMutation,
          variables: {
            id: workItem.id,
            labelIds: [replaceWith],
          },
        });
      }

      // remove the one to replace
      await client.mutate({
        mutation: removeLabelsMutation,
        variables: {
          id: workItem.id,
          labelIds: [toReplace],
        },
      });
    }
  } catch (e) {
    console.error('Swapping labels', e.message, JSON.stringify(e, null, '  '));
  }
}

swap();
