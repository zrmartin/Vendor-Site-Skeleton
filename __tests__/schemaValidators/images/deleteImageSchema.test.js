import { deleteImageSchema } from '../../../validators'

test('deleteImageSchema passes for valid schema', async () => {
  var testSchema = {
    id: "123",
  }
  let results = null

  try {
    results = await deleteImageSchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toBeUndefined();
});

test('deleteImageSchema fails for missing fields', async () => {
  var testSchema = {
    id: undefined,
  }
  let results = null
  
  try {
    results = await deleteImageSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id is required");
});

test('deleteImageSchema fails for invalid types', async () => {
  var testSchema = {
    id: [],
  }
  let results = null
  
  try {
    results = await deleteImageSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id must be a string");
});