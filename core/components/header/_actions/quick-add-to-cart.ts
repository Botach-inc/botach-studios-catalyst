'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';

import { graphql } from '~/client/graphql';
import { addToOrCreateCart } from '~/lib/cart';

type CartSelectedOptionsInput = ReturnType<typeof graphql.scalar<'CartSelectedOptionsInput'>>;

export interface QuickAddToCartInput {
  productEntityId: number;
  quantity?: number;
  selectedOptions?: Record<string, string>;
}

export interface QuickAddToCartResult {
  success: boolean;
  error?: string;
}

export async function quickAddToCart(
  input: QuickAddToCartInput,
): Promise<QuickAddToCartResult> {
  const { productEntityId, quantity = 1, selectedOptions = {} } = input;

  const cartSelectedOptions: CartSelectedOptionsInput = {};

  const optionEntries = Object.entries(selectedOptions);

  if (optionEntries.length > 0) {
    cartSelectedOptions.multipleChoices = optionEntries.map(([optionEntityId, valueEntityId]) => ({
      optionEntityId: Number(optionEntityId),
      optionValueEntityId: Number(valueEntityId),
    }));
  }

  try {
    await addToOrCreateCart({
      lineItems: [
        {
          productEntityId,
          selectedOptions: cartSelectedOptions,
          quantity,
        },
      ],
    });

    return { success: true };
  } catch (error) {
    if (error instanceof BigCommerceGQLError) {
      const message = error.errors
        .map(({ message: msg }) => {
          if (msg.includes('Not enough stock:')) {
            return msg.replace('Not enough stock: ', '').replace(/\(\w.+\)\s{1}/, '');
          }

          return msg;
        })
        .join(', ');

      return { success: false, error: message };
    }

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
