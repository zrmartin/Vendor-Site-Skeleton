const { DeleteIfExists, IfNotExists, executeFQL, CreateOrUpdateRole, CreateOrUpdateFunction } = require('../helpers/fql')
const { CreateProduct, GetAllProducts, DeleteProduct } = require('../queries/products')
const { COLLECTIONS: { Products, Accounts } } = require('../../util/constants/collections')
const { INDEXES: { All_Products }} = require('../../util/constants/indexes')
const { FUNCTION_ROLES: { FunctionRole_Products }} = require('../../util/constants/functionRoles')
const { FUNCTIONS: { Create_Product, Get_All_Products, Delete_Product }} = require('../../util/constants/functions')
const { MEMBERSHIP_ROLES: { MembershipRole_Shop_Owner }} = require('../../util/constants/membershipRoles')

const faunadb = require('faunadb')
const q = faunadb.query
const { Query, Lambda, Var, Role, CreateCollection, CreateIndex, Collection, Index, Function } = q

/* Collection */
const CreateProductsCollection = CreateCollection({ name: Products })

/* Indexes */
const CreateIndexAllProducts = CreateIndex({
  name: All_Products,
  source: Collection(Products),
  // this is the default collection index, no terms or values are provided
  // which means the index will sort by reference and return only the reference.
  serialized: true
})

/* Function Roles */
const CreateFnRoleProducts = CreateOrUpdateRole({
  name: FunctionRole_Products,
  privileges: [
    {
      resource: Index(All_Products),
      actions: { read: true }
    },
    {
      resource: Collection(Products),
      actions: { read: true, write: true, delete: true, create: true }
    }
  ]
})

/* Functions */
const CreateProductUDF = CreateOrUpdateFunction({
  name: Create_Product,
  body: Query(Lambda(['name', 'price', 'quantity'], CreateProduct(Var('name'), Var('price'), Var('quantity')))),
  role: Role(FunctionRole_Products)
})

const GetAllProductsUDF = CreateOrUpdateFunction({
  name: Get_All_Products,
  body: Query(Lambda([], GetAllProducts())),
  role: Role(FunctionRole_Products)
})

const DeleteProductUDF = CreateOrUpdateFunction({
  name: Delete_Product,
  body: Query(Lambda(['id'], DeleteProduct(Var('id')))),
  role: Role(FunctionRole_Products)
})

/* Membership Roles */
const CreateShopOwnerRole = CreateOrUpdateRole({
  name: MembershipRole_Shop_Owner,
  membership: [{ resource: Collection(Accounts) }],
  privileges: [
    {
      resource: q.Function(Create_Product),
      actions: {
        call: true
      }
    },
    {
      resource: q.Function(Get_All_Products),
      actions: {
        call: true
      }
    },
    {
      resource: q.Function(Delete_Product),
      actions: {
        call: true
      }
    }
  ]
})

async function createProductsCollection(client) {
  // Create Collection
  await client.query(IfNotExists(Collection(Products), CreateProductsCollection))

  // Create Indexes
  await client.query(IfNotExists(Index(All_Products), CreateIndexAllProducts))

  // Create Function Roles
  await executeFQL(client, CreateFnRoleProducts, 'roles - function role - products')

  // Create Functions
  await executeFQL(client, CreateProductUDF, 'functions - create product')
  await executeFQL(client, GetAllProductsUDF, 'functions - get all products')
  await executeFQL(client, DeleteProductUDF, 'functions - delete product')

  // Create Membership Roles
  await executeFQL(client, CreateShopOwnerRole, 'roles - membership role - shop owner')
}

async function deleteProductsCollection(client) {
  await client.query(DeleteIfExists(Collection(Products)))
  await client.query(DeleteIfExists(Index(All_Products)))
  await client.query(DeleteIfExists(Role(FunctionRole_Products)))
  await client.query(DeleteIfExists(Function(Create_Product)))
  await client.query(DeleteIfExists(Function(Get_All_Products)))
  await client.query(DeleteIfExists(Role(MembershipRole_Shop_Owner)))
}

module.exports = { createProductsCollection, deleteProductsCollection }
