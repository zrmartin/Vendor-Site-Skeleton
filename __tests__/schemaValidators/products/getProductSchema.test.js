import { getProductSchema } from '../../../validators'

test('getProductSchema passes for valid schema', async () => {
  var testSchema = {
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

test('getProductSchema fails for missing id', async () => {
  var testSchema = {
    id: ""
  }
  let results = null
  
  try {
    results = await getProductSchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id is required");
});

test('getProductSchema fails for invalid type', async () => {
  var testSchema = {
    id: []
  }
  let results = null
  
  try {
    results = await getProductSchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id must be a string");
});