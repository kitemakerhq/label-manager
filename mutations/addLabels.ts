import gql from 'graphql-tag';

export const addLabelsMutation = gql`
  mutation AddLabels($id: ID!, $labelIds: [ID!]!) {
    addLabelsToWorkItem(input: { id: $id, labelIds: $labelIds }) {
      workItem {
        id
        labels {
          id
        }
      }
    }
  }
`;
