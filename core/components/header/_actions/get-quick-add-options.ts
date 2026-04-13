'use server';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { Field } from '@/vibes/soul/sections/product-detail/schema';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const MultipleChoiceFieldFragment = graphql(`
  fragment QuickAddMultipleChoiceFieldFragment on MultipleChoiceOption {
    entityId
    displayName
    displayStyle
    isRequired
    values(first: 50) {
      edges {
        node {
          entityId
          label
          isDefault
          isSelected
          ... on SwatchOptionValue {
            __typename
            hexColors
            imageUrl(lossy: true, width: 40)
          }
          ... on ProductPickListOptionValue {
            __typename
            defaultImage {
              altText
              url: urlTemplate(lossy: true)
            }
          }
        }
      }
    }
  }
`);

const CheckboxFieldFragment = graphql(`
  fragment QuickAddCheckboxFieldFragment on CheckboxOption {
    entityId
    isRequired
    displayName
    checkedByDefault
    label
    checkedOptionValueEntityId
    uncheckedOptionValueEntityId
  }
`);

const NumberFieldFragment = graphql(`
  fragment QuickAddNumberFieldFragment on NumberFieldOption {
    entityId
    displayName
    isRequired
  }
`);

const TextFieldFragment = graphql(`
  fragment QuickAddTextFieldFragment on TextFieldOption {
    entityId
    displayName
    isRequired
  }
`);

const MultiLineTextFieldFragment = graphql(`
  fragment QuickAddMultiLineTextFieldFragment on MultiLineTextFieldOption {
    entityId
    displayName
    isRequired
  }
`);

const DateFieldFragment = graphql(`
  fragment QuickAddDateFieldFragment on DateFieldOption {
    entityId
    displayName
    isRequired
  }
`);

const QuickAddRouteQuery = graphql(
  `
    query QuickAddRouteQuery($path: String!) {
      site {
        route(path: $path) {
          node {
            __typename
            ... on Product {
              entityId
              productOptions(first: 50) {
                edges {
                  node {
                    __typename
                    entityId
                    displayName
                    isRequired
                    ...QuickAddMultipleChoiceFieldFragment
                    ...QuickAddCheckboxFieldFragment
                    ...QuickAddNumberFieldFragment
                    ...QuickAddTextFieldFragment
                    ...QuickAddMultiLineTextFieldFragment
                    ...QuickAddDateFieldFragment
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  [
    MultipleChoiceFieldFragment,
    CheckboxFieldFragment,
    NumberFieldFragment,
    TextFieldFragment,
    MultiLineTextFieldFragment,
    DateFieldFragment,
  ],
);

export interface QuickAddOptionsResult {
  entityId: number | null;
  fields: Field[];
  hasComplexOptions: boolean;
}

export async function getQuickAddOptions(
  productPath: string,
): Promise<QuickAddOptionsResult> {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: QuickAddRouteQuery,
    variables: { path: productPath },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const node = data.site.route?.node;

  if (!node || node.__typename !== 'Product') {
    return { entityId: null, fields: [], hasComplexOptions: false };
  }

  const options = removeEdgesAndNodes(node.productOptions);

  let hasComplexOptions = false;
  const fields: Field[] = [];

  for (const option of options) {
    if (
      option.__typename === 'NumberFieldOption' ||
      option.__typename === 'TextFieldOption' ||
      option.__typename === 'MultiLineTextFieldOption' ||
      option.__typename === 'DateFieldOption'
    ) {
      hasComplexOptions = true;
      continue;
    }

    if (option.__typename === 'MultipleChoiceOption') {
      const values = removeEdgesAndNodes(option.values);

      fields.push({
        type: 'select',
        persist: false,
        label: option.displayName,
        required: option.isRequired,
        name: option.entityId.toString(),
        defaultValue: values.find((value) => value.isDefault)?.entityId.toString(),
        options: values.map((value) => ({
          label: value.label,
          value: value.entityId.toString(),
        })),
      });
    }

    if (option.__typename === 'CheckboxOption') {
      fields.push({
        type: 'checkbox',
        persist: false,
        label: option.displayName,
        required: option.isRequired,
        name: option.entityId.toString(),
        defaultValue: option.checkedByDefault ? 'true' : undefined,
        uncheckedValue: option.uncheckedOptionValueEntityId.toString(),
        checkedValue: option.checkedOptionValueEntityId.toString(),
      });
    }
  }

  return { entityId: node.entityId, fields, hasComplexOptions };
}
