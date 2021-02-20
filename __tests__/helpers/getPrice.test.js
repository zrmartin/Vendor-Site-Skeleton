import { getPrice } from '../../util/helpers'

test('getPrice Succesfully returns formatted price', () => {
  const priceInCents = 1000

  const priceInDollars = getPrice(priceInCents)
  expect(priceInDollars).toEqual("10");
});
