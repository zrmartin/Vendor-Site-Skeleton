import { createImagesSchema } from '../../../validators'

test('createImagesSchema passes for valid schema', async () => {
  var testSchema = {
    imageKeys: ["123"],
    entityId: "123",
    entityCollection: "testCollection"
  }
  let results = null

  try {
    results = await createImagesSchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toBeUndefined();
});

test('createImagesSchema fails for missing fields', async () => {
  var testSchema = {
    imageKeys: undefined,
    entityId: undefined,
    entityCollection: undefined,
  }
  let results = null
  
  try {
    results = await createImagesSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Image Keys is required");
  expect(results.errors).toContain("Entity Id is required");
  expect(results.errors).toContain("Entity Collection is required");
});

test('createImagesSchema fails for invalid types', async () => {
  var testSchema = {
    imageKeys: false,
    entityId: [],
    entityCollection: [],
  }
  let results = null
  
  try {
    results = await createImagesSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Image Keys must be an Array");
  expect(results.errors).toContain("Entity Id must be a string");
  expect(results.errors).toContain("Entity Collection must be a string");
});

test('createImagesSchema fails for imageKeys length < 1', async () => {
  var testSchema = {
    imageKeys: [],
    entityId: "123",
    entityCollection: "TestCollection",
  }
  let results = null
  
  try {
    results = await createImagesSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Number of Images must be greater than 0");
});