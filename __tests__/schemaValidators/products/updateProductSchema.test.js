import { updateProductSchema } from '../../../validators'

test('updateProductSchema passes for valid schema', async () => {
  var testSchema = {
    id: "123",
    name: "Test Product",
    price: 100.00,
    quantity: 10
  }
  let results = null

  try {
    results = await updateProductSchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toBeUndefined();
});

test('updateProductSchema fails for missing fields', async () => {
  var testSchema = {
    id: undefined,
    name: undefined,
    price: undefined,
    quantity: undefined
  }
  let results = null
  
  try {
    results = await updateProductSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id is required");
  expect(results.errors).toContain("Name is required");
  expect(results.errors).toContain("Price is required");
  expect(results.errors).toContain("Quantity is required");
});

test('updateProductSchema fails for invalid type', async () => {
  var testSchema = {
    id: [],
    name: [],
    price: [],
    quantity: [],
    
  }
  let results = null
  
  try {
    results = await updateProductSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Id must be a string");
  expect(results.errors).toContain("Name must be a string");
  expect(results.errors).toContain("Price must be a number");
  expect(results.errors).toContain("Quantity must be a number");
});

test('updateProductSchema fails for negative price or quantity', async () => {
  var testSchema = {
    id: "123",
    name: "Test Product",
    price: -100,
    quantity: -100,
    
  }
  let results = null
  
  try {
    results = await updateProductSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Price must be positive");
  expect(results.errors).toContain("Quantity must be positive");
});

test('updateProductSchema fails for non-integer quantity', async () => {
  var testSchema = {
    id: "123",
    name: "Test Product",
    price: 100.00,
    quantity: 10.23,
    
  }
  let results = null
  
  try {
    results = await updateProductSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Quantity must be a whole number");
});