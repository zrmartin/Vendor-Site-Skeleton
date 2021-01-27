import { DeleteIfExists, IfNotExists, executeFQL, CreateOrUpdateRole, CreateOrUpdateFunction } from '../helpers/fql.js'
import faunadb from 'faunadb'
import { CreateProduct, GetAllProducts } from '../queries/products.js'
const q = faunadb.query
const { Query, Lambda, Var, Role, CreateCollection, CreateIndex, Collection, Index, Function } = q


/* Collection */

const CreateProductsCollection = CreateCollection({ name: 'products' })

/* Indexes */
const CreateIndexAllProducts = CreateIndex({
  name: 'all_products',
  source: Collection('products'),
  // this is the default collection index, no terms or values are provided
  // which means the index will sort by reference and return only the reference.
  serialized: true
})

/* Function Roles */
const CreateFnRoleProducts = CreateOrUpdateRole({
  name: 'functionrole_products',
  privileges: [
    {
      resource: Index('all_products'),
      actions: { read: true }
    },
    {
      resource: Collection('products'),
      actions: { read: true, write: true, delete: true, create: true }
    }
  ]
})

/* Functions */
const CreateProductUDF = CreateOrUpdateFunction({
  name: 'create_product',
  body: Query(Lambda(['name', 'price', 'quantity'], CreateProduct(Var('name'), Var('price'), Var('quantity')))),
  role: Role('functionrole_products')
})

const GetAllProductsUDF = CreateOrUpdateFunction({
  name: 'get_all_products',
  body: Query(Lambda([], GetAllProducts())),
  role: Role('functionrole_products')
})

/* Membership Roles */
const CreateShopOwnerRole = CreateOrUpdateRole({
  name: 'membership_role_shop_owner',
  membership: [{ resource: Collection('accounts') }],
  privileges: [
    {
      resource: q.Function('create_product'),
      actions: {
        call: true
      }
    },
    {
      resource: q.Function('get_all_products'),
      actions: {
        call: true
      }
    }
  ]
})

async function createProductsCollection(client) {
  // Create Collection
  await client.query(IfNotExists(Collection('products'), CreateProductsCollection))

  // Create Indexes
  await client.query(IfNotExists(Index('all_products'), CreateIndexAllProducts))

  // Create Function Roles
  await executeFQL(client, CreateFnRoleProducts, 'roles - function role - products')

  // Create Functions
  await executeFQL(client, CreateProductUDF, 'functions - create product')
  await executeFQL(client, GetAllProductsUDF, 'functions - get all products')

  // Create Membership Roles
  await executeFQL(client, CreateShopOwnerRole, 'roles - membership role - shop owner')
}

async function deleteProductsCollection(client) {
  await client.query(DeleteIfExists(Collection('products')))
  await client.query(DeleteIfExists(Index('all_products')))
  await client.query(DeleteIfExists(Role('functionrole_products')))
  await client.query(DeleteIfExists(Function('create_product')))
  await client.query(DeleteIfExists(Function('get_all_products')))
  await client.query(DeleteIfExists(Role('membership_role_shop_owner')))
}

export { createProductsCollection, deleteProductsCollection }
