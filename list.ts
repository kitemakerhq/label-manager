import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import 'cross-fetch/polyfill';
import { organizationQuery } from './queries/organization';

if (!process.env.KITEMAKER_TOKEN) {
  console.error(
    'Could not find Kitemaker token. Make sure the KITEMAKER_TOKEN environment variable is set.'
  );
  process.exit(-1);
}

const host = process.env.KITEMAKER_HOST ?? 'https://toil.kitemaker.co';

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

async function list() {
  try {
    const result = await client.query({ query: organizationQuery });
    if (result.errors) {
      console.error('Unable to dump spaces and labels', JSON.stringify(result.errors, null, '  '));
      process.exit(-1);
    }
    console.log(JSON.stringify(result.data.organization, null, '  '));
  } catch (e) {
    console.error('Error dumping spaces and labels', e.message, JSON.stringify(e, null, '  '));
  }
}

list();
