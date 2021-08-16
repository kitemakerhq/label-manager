import gql from 'graphql-tag';

export const organizationQuery = gql`
  query Organization {
    organization {
      spaces {
        id
        key
        name

        labels {
          id
          name
        }
      }
    }
  }
`;
