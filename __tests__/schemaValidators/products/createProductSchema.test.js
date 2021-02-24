import { createProductSchema } from '../../../validators'

test('createProductSchema passes for valid schema', async () => {
  let testSchema = {
    name: "Test Product",
    price: 100.00,
    quantity: 10
  }
  let results = null

  try {
    results = await createProductSchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toBeUndefined();
});

test('createProductSchema fails for missing fields', async () => {
  let testSchema = {
    name: undefined,
    price: undefined,
    quantity: undefined
  }
  let results = null
  
  try {
    results = await createProductSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Name is required");
  expect(results.errors).toContain("Price is required");
  expect(results.errors).toContain("Quantity is required");
});

test('createProductSchema fails for invalid type', async () => {
  let testSchema = {
    name: [],
    price: [],
    quantity: [],
    
  }
  let results = null
  
  try {
    results = await createProductSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Name must be a string");
  expect(results.errors).toContain("Price must be a number");
  expect(results.errors).toContain("Quantity must be a number");
});

test('createProductSchema fails for negative price or quantity', async () => {
  let testSchema = {
    name: "Test Product",
    price: -100,
    quantity: -100,
    
  }
  let results = null
  
  try {
    results = await createProductSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Price must be positive");
  expect(results.errors).toContain("Quantity must be positive");
});

test('createProductSchema fails for non-integer quantity', async () => {
  let testSchema = {
    name: "Test Product",
    price: 100.00,
    quantity: 10.23,
    
  }
  let results = null
  
  try {
    results = await createProductSchema.validate(testSchema, { abortEarly: false })
  }
  catch (e){
    results = e
  }

  expect(results.errors).toContain("Quantity must be a whole number");
});