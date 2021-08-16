import gql from 'graphql-tag';

export const workItemsQuery = gql`
  query WorkItems($space: ID!, $cursor: String) {
    workItems(spaceId: $space, cursor: $cursor, count: 50) {
      workItems {
        id
        labels {
          id
        }
      }
      cursor
      hasMore
    }
  }
`;
