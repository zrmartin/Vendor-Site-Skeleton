import { getProductSchema } from '../../../validators'

test('getProductSchema passes for valid schema', async () => {
  let testSchema = {
    id: "123"
  }
  let results = null

  try {
    results = await getProductSchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toBeUndefined();
});

test('getProductSchema fails for missing fields', async () => {
  let testSchema = {
    id: undefined
  }
  let results = null
  
  try {
    results = await getProductSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id is required");
});

test('getProductSchema fails for invalid types', async () => {
  let testSchema = {
    id: []
  }
  let results = null
  
  try {
    results = await getProductSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id must be a string");
});