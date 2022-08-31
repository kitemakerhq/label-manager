import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import commandLineArgs from 'command-line-args';
import 'cross-fetch/polyfill';
import { createLabelMutation } from './mutations/createLabel';
import { organizationQuery } from './queries/organization';

if (!process.env.KITEMAKER_TOKEN) {
  console.error(
    'Could not find Kitemaker token. Make sure the KITEMAKER_TOKEN environment variable is set.'
  );
  process.exit(-1);
}

const host = process.env.KITEMAKER_HOST ?? 'https://toil.kitemaker.co';

const opts = commandLineArgs([
  { name: 'omit-spaces', alias: 'o', type: String },
  { name: 'labels', alias: 'l', type: String },
  { name: 'dry-run', type: Boolean },
]);

if (!opts.labels) {
  console.error(
    'Please provide a comma-separated list of labels (-l) and (optionally) a comma-separated list of spaces to not create labels in'
  );
  console.error(
    'If you want to specify the label color, separate the name and color with ":" (e.g. -l bug:ff0000,feature:00ff00 )'
  );
  process.exit(-1);
}

const spacesToOmit = (opts['omit-spaces'] ?? '').split(',').map((s: string) => s.toLowerCase());

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

async function createLabelsInSpace(
  spaceId: string,
  spaceName: string,
  labels: Array<{ name: string; color?: string }>
): Promise<void> {
  if (!labels.length) {
    return;
  }

  console.log(`Creating labels ${labels.map((l) => l.name).join()} in space ${spaceName}`);

  if (opts['dry-run']) {
    return;
  }

  for (const label of labels) {
    await client.mutate({
      mutation: createLabelMutation,
      variables: {
        space: spaceId,
        name: label.name,
        color: label.color,
      },
    });
  }
}

async function create() {
  try {
    const result = await client.query({ query: organizationQuery });
    if (result.errors) {
      throw Error('Error fetching organization data');
    }
    const org = result.data.organization;

    const allLabels: Array<{ name: string; color?: string }> = opts.labels
      .split(',')
      .map((label: string) => {
        if (label.includes(':')) {
          const [name, color] = label.split(':');
          return { name, color };
        }

        return { name: label };
      });
    for (const space of org.spaces) {
      if (
        spacesToOmit.includes(space.name.toLowerCase()) ||
        spacesToOmit.includes(space.key.toLowerCase())
      ) {
        continue;
      }

      const labelsToCreate = allLabels.filter(
        (label) =>
          !space.labels.find(
            (spaceLabel: { name: string }) =>
              label.name.toLowerCase() === spaceLabel.name.toLowerCase()
          )
      );
      await createLabelsInSpace(space.id, space.name, labelsToCreate);
    }
  } catch (e) {
    console.error('Error creating labels', e.message, JSON.stringify(e, null, '  '));
  }
}

create();
