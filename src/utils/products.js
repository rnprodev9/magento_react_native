import { THUMBNAIL_SK } from '../constants';

export const getProductThumbnailFromAttribute = product => {
  let result = '';
  product.custom_attributes.some(attribute => {
    if (attribute.attribute_code === THUMBNAIL_SK) {
      result = attribute.value;
      return true;
    }
    return false;
  });
  return result;
};

export const getValueFromAttribute = (product, key) => {
  if (
    !product ||
    !('custom_attributes' in product) ||
    !Array.isArray(product.custom_attributes)
  ) {
    return undefined;
  }
  const result = product.custom_attributes.find(
    attribute => attribute.attribute_code === key,
  );
  if (result) {
    return result.value;
  }
  return undefined;
};

export function isAttributeAndValuePresent(
  child,
  attributeCode,
  attributeValue,
) {
  return child.custom_attributes.some(
    item =>
      item.attribute_code === attributeCode &&
      parseInt(item.value, 10) === attributeValue,
  );
}

/**
 * Stores price of the product,
 * in case of `simple` product, starting and ending will be same
 * in case of `configurable` product, they may or may not defer
 *
 * @typedef {Object} Price
 * @property {boolean} starting - lowest price of the product
 * @property {boolean} ending - highest price of the product
 */
export class Price {
  constructor(starting, ending) {
    this.starting = starting;
    this.ending = ending;
  }
}

/**
 * Calculates the lowest and highest price among the children
 * of `configurable` type product
 *
 * @param {object[]} children all the `simple` child product of a `configurable` type product
 * @return {Price} instance
 */
export const getPriceFromChildren = children => {
  let startingPrice;
  let endingPrice;
  if (children) {
    children.forEach(child => {
      if (startingPrice === undefined && endingPrice === undefined) {
        startingPrice = child.price;
        endingPrice = startingPrice;
      } else if (child.price < startingPrice) {
        startingPrice = child.price;
      } else if (child.price > endingPrice) {
        endingPrice = child.price;
      }
    });

    return new Price(startingPrice, endingPrice);
  }
  return new Price(0, 0);
};
