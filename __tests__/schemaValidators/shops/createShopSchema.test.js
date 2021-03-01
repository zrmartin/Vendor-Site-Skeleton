import { createShopSchema } from '../../../validators'

test('createShopSchema passes for valid schema', async () => {
  let testSchema = {
    name: "Test Shop",
  }
  let results = null

  try {
    results = await createShopSchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toBeUndefined();
});

test('createShopSchema fails for missing fields', async () => {
  let testSchema = {
    name: undefined
  }
  let results = null
  
  try {
    results = await createShopSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Name is required");
});

test('createShopSchema fails for invalid type', async () => {
  let testSchema = {
    name: [],
  }
  let results = null
  
  try {
    results = await createShopSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Name must be a string");
});