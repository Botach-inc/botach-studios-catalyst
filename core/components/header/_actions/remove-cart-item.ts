'use server';

import { revalidateTag } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { clearCartId, getCartId } from '~/lib/cart';

const DeleteCartLineItemMutation = graphql(`
  mutation DeleteCartDrawerLineItem($input: DeleteCartLineItemInput!) {
    cart {
      deleteCartLineItem(input: $input) {
        cart {
          entityId
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof DeleteCartLineItemMutation>;
type DeleteCartLineItemInput = Variables['input'];

export async function removeCartItem(
  lineItemEntityId: Omit<DeleteCartLineItemInput, 'cartEntityId'>['lineItemEntityId'],
) {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const cartId = await getCartId();

  if (!cartId || !lineItemEntityId) return null;

  const response = await client.fetch({
    document: DeleteCartLineItemMutation,
    variables: {
      input: {
        cartEntityId: cartId,
        lineItemEntityId,
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const cart = response.data.cart.deleteCartLineItem?.cart;

  if (!cart) {
    await clearCartId();
  }

  revalidateTag(TAGS.cart, { expire: 0 });

  return cart;
}
