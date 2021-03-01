import { getAllProductsForShopSchema } from '../../../validators'

test('getAllProductsForShopSchema passes for valid schema', async () => {
  let testSchema = {
    shopId: "123"
  }
  let results = null

  try {
    results = await getAllProductsForShopSchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toBeUndefined();
});

test('getAllProductsForShopSchema fails for missing fields', async () => {
  let testSchema = {
    shopId: undefined
  }
  let results = null
  
  try {
    results = await getAllProductsForShopSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id is required");
});

test('getAllProductsForShopSchema fails for invalid types', async () => {
  let testSchema = {
    shopId: []
  }
  let results = null
  
  try {
    results = await getAllProductsForShopSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id must be a string");
});