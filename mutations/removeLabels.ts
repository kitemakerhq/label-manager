import gql from 'graphql-tag';

export const removeLabelsMutation = gql`
  mutation RemoveLabels($id: ID!, $labelIds: [ID!]!) {
    removeLabelsFromWorkItem(input: { id: $id, labelIds: $labelIds }) {
      workItem {
        id
        labels {
          id
        }
      }
    }
  }
`;
