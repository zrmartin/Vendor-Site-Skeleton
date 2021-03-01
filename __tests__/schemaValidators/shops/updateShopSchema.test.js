import { updateShopSchema } from '../../../validators'

test('updateShopSchema passes for valid schema', async () => {
  let testSchema = {
    id: "123",
    name: "Test Shop",
  }
  let results = null

  try {
    results = await updateShopSchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toBeUndefined();
});

test('updateShopSchema fails for missing fields', async () => {
  let testSchema = {
    id: undefined,
    name: undefined
  }
  let results = null
  
  try {
    results = await updateShopSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id is required");
  expect(results.errors).toContain("Name is required");
});

test('updateShopSchema fails for invalid type', async () => {
  let testSchema = {
    id: [],
    name: []
    
  }
  let results = null
  
  try {
    results = await updateShopSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id must be a string");
  expect(results.errors).toContain("Name must be a string");
});