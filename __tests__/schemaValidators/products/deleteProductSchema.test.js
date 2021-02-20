import { deleteProductSchema } from '../../../validators'

test('deleteProductSchema passes for valid schema', async () => {
  let testSchema = {
    id: "123"
  }
  let results = null

  try {
    results = await deleteProductSchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toBeUndefined();
});

test('deleteProductSchema fails for missing fields', async () => {
  let testSchema = {
    id: undefined
  }
  let results = null
  
  try {
    results = await deleteProductSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id is required");
});

test('deleteProductSchema fails for invalid types', async () => {
  let testSchema = {
    id: []
  }
  let results = null
  
  try {
    results = await deleteProductSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id must be a string");
});