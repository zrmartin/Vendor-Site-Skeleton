const { DeleteIfExists, IfNotExists, executeFQL, CreateOrUpdateRole, CreateOrUpdateFunction } = require('../helpers/fql')
const { CreateProduct, GetAllProducts, GetProduct, UpdateProduct, DeleteProduct } = require('../queries/products')
const { COLLECTIONS: { Products, Accounts } } = require('../../util/constants/database/collections')
const { INDEXES: { All_Products }} = require('../../util/constants/database/indexes')
const { FUNCTIONS: { Create_Product, Get_All_Products, Get_Product, Delete_Product, Update_Product }} = require('../../util/constants/database/functions')
const { MEMBERSHIP_ROLES: { MembershipRole_Shop_Owner }} = require('../../util/constants/database/membershipRoles')

const faunadb = require('faunadb')
const q = faunadb.query
const { Query, Lambda, Var, Role, CreateCollection, CreateIndex, Collection, Index, Function, Select, Let, CurrentIdentity, Get, Equals, Indexes } = q

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

/* Functions */
const CreateProductUDF = CreateOrUpdateFunction({
  name: Create_Product,
  body: Query(Lambda(['name', 'price', 'quantity'], CreateProduct(Var('name'), Var('price'), Var('quantity')))),
})

const GetAllProductsUDF = CreateOrUpdateFunction({
  name: Get_All_Products,
  body: Query(Lambda([], GetAllProducts())),
})

const GetProductUDF = CreateOrUpdateFunction({
  name: Get_Product,
  body: Query(Lambda(['id'], GetProduct(Var('id')))),
})

const UpdateProductUDF = CreateOrUpdateFunction({
  name: Update_Product,
  body: Query(Lambda(['id', 'name', 'price', 'quantity'], UpdateProduct(Var('id'), Var('name'), Var('price'), Var('quantity')))),
})

const DeleteProductUDF = CreateOrUpdateFunction({
  name: Delete_Product,
  body: Query(Lambda(['id'], DeleteProduct(Var('id')))),
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
      resource: q.Function(Get_Product),
      actions: {
        call: true
      }
    },
    {
      resource: q.Function(Update_Product),
      actions: {
        call: true
      }
    },
    {
      resource: q.Function(Delete_Product),
      actions: {
        call: true
      }
    },
    {
      resource: Index(All_Products),
      actions: { read: true }
    },
    {
      resource: Indexes(),
      actions: { read: true }
    },
    {
      resource: Collection(Products),
      actions: {
        write: true, 
        delete: true, 
        create: true,
        read: Query(
          Lambda("productRef", Let(
            {
              product: Get(Var("productRef")),
              accountRef: Select(["data", "account"], Var("product"))
            },
            Equals(Var("accountRef"), CurrentIdentity())
          ))
        )
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

  // Create Functions
  await executeFQL(client, CreateProductUDF, 'functions - create product')
  await executeFQL(client, GetAllProductsUDF, 'functions - get all products')
  await executeFQL(client, GetProductUDF, 'functions - get product')
  await executeFQL(client, UpdateProductUDF, 'functions - update product')
  await executeFQL(client, DeleteProductUDF, 'functions - delete product')

  // Create Membership Roles
  await executeFQL(client, CreateShopOwnerRole, 'roles - membership role - shop owner')
}

async function deleteProductsCollection(client) {
  await client.query(DeleteIfExists(Collection(Products)))
  await client.query(DeleteIfExists(Index(All_Products)))
  await client.query(DeleteIfExists(Function(Create_Product)))
  await client.query(DeleteIfExists(Function(Get_All_Products)))
  await client.query(DeleteIfExists(Function(Get_Product)))
  await client.query(DeleteIfExists(Function(Update_Product)))
  await client.query(DeleteIfExists(Function(Delete_Product)))
  await client.query(DeleteIfExists(Role(MembershipRole_Shop_Owner)))
}

module.exports = { createProductsCollection, deleteProductsCollection }
