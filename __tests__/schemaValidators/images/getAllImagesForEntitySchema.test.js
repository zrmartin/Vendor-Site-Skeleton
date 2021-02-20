import { getAllImagesForEntitySchema } from '../../../validators'

test('getAllImagesForEntitySchema passes for valid schema', async () => {
  var testSchema = {
    entityId: "123",
    entityCollection: "testCollection"
  }
  let results = null

  try {
    results = await getAllImagesForEntitySchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toBeUndefined();
});

test('getAllImagesForEntitySchema fails for missing fields', async () => {
  var testSchema = {
    entityId: undefined,
    entityCollection: undefined,
  }
  let results = null
  
  try {
    results = await getAllImagesForEntitySchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Entity Id is required");
  expect(results.errors).toContain("Entity Collection is required");
});

test('getAllImagesForEntitySchema fails for invalid types', async () => {
  var testSchema = {
    entityId: [],
    entityCollection: [],
  }
  let results = null
  
  try {
    results = await getAllImagesForEntitySchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Entity Id must be a string");
  expect(results.errors).toContain("Entity Collection must be a string");
});