const { DeleteIfExists, IfNotExists, executeFQL, CreateOrUpdateRole, CreateOrUpdateFunction } = require('../helpers/fql')
const { CreateProduct, GetAllProducts, GetProduct, UpdateProduct, DeleteProduct } = require('../queries/products')
const { COLLECTIONS: { Products, Accounts } } = require('../../util/constants/database/collections')
const { INDEXES: { All_Products }} = require('../../util/constants/database/indexes')
const { FUNCTIONS: { Create_Product, Get_All_Products, Get_Product, Delete_Product, Update_Product }} = require('../../util/constants/database/functions')
const { MEMBERSHIP_ROLES: { MembershipRole_Shop_Owner_Product_Access }} = require('../../util/constants/database/membershipRoles')

const faunadb = require('faunadb')
const q = faunadb.query
const { Query, Lambda, Var, Role, CreateCollection, CreateIndex, Collection, Index, Function, Select, Let, CurrentIdentity, Get, Equals, Indexes, And } = q

/* Collection */
const CreateProductsCollection = CreateCollection({ name: Products })

/* Indexes */
const CreateIndexAllProducts = (productsCollection) => CreateIndex({
  name: All_Products,
  source: productsCollection,
  // this is the default collection index, no terms or values are provided
  // which means the index will sort by reference and return only the reference.
  serialized: true
})

/* Function Roles */

/* Functions */
const CreateProductUDF = CreateOrUpdateFunction({
  name: Create_Product,
  body: Query(Lambda(['data'], CreateProduct(Select(['name'], Var('data')), Select(['price'], Var('data')), Select(['quantity'], Var('data'))))),
})

const GetAllProductsUDF = CreateOrUpdateFunction({
  name: Get_All_Products,
  body: Query(Lambda([], GetAllProducts())),
})

const GetProductUDF = CreateOrUpdateFunction({
  name: Get_Product,
  body: Query(Lambda(['data'], GetProduct(Select(['id'], Var('data'))))),
})

const UpdateProductUDF = CreateOrUpdateFunction({
  name: Update_Product,
  body: Query(Lambda(['data'], UpdateProduct(Select(['id'], Var('data')), Select(['name'], Var('data')), Select(['price'], Var('data')), Select(['quantity'], Var('data'))))),
})

const DeleteProductUDF = CreateOrUpdateFunction({
  name: Delete_Product,
  body: Query(Lambda(['data'], DeleteProduct(Select(['id'], Var('data'))))),
})

/* Membership Roles */
const CreateShopOwnerProductRole = (createProductFunction, getAllProductsFunction, getProductFunction, updateProductFunction, deleteProductFunction, allProductsIndex, productsCollection) => CreateOrUpdateRole({
  name: MembershipRole_Shop_Owner_Product_Access,
  membership: [{ resource: Collection(Accounts) }],
  privileges: [
    {
      resource: createProductFunction,
      actions: {
        call: true
      }
    },
    {
      resource: getAllProductsFunction,
      actions: {
        call: true
      }
    },
    {
      resource: getProductFunction,
      actions: {
        call: true
      }
    },
    {
      resource: updateProductFunction,
      actions: {
        call: true
      }
    },
    {
      resource: deleteProductFunction,
      actions: {
        call: true
      }
    },
    {
      resource: allProductsIndex,
      actions: { read: true }
    },
    {
      resource: Indexes(),
      actions: { read: true }
    },
    {
      resource: productsCollection,
      actions: {
        write: Query(
          Lambda(["oldData", "newData"],
            And(
              Equals(CurrentIdentity(), Select(["data", "account"], Var("oldData"))),
              Equals(
                Select(["data", "account"], Var("oldData")),
                Select(["data", "account"], Var("newData"))
              )
            )
          )
        ), 
        delete: Query(
          Lambda("productRef", Let(
            {
              product: Get(Var("productRef")),
              accountRef: Select(["data", "account"], Var("product"))
            },
            Equals(Var("accountRef"), CurrentIdentity())
          ))
        ), 
        create: true,
        read: Query(
          Lambda("productRef", Let(
            {
              product: Get(Var("productRef")),
              accountRef: Select(["data", "account"], Var("product"))
            },
            Equals(Var("accountRef"), CurrentIdentity())
          ))
        ),
      }
    }
  ]
})

async function createProductsCollection(client) {
  // Create Collection
  await client.query(
    Let([
      // Create Collections
      {
        products_collection: IfNotExists(Collection(Products), CreateProductsCollection)
      },
      // Create Indexes
      {
        all_products_index: IfNotExists(Index(All_Products), CreateIndexAllProducts(
          Select(["ref"], Var("products_collection"))
        ))
      },
      // Create Function Roles
      // Create Functions
      {
        create_product_function: CreateProductUDF
      },
      {
        get_all_products_function: GetAllProductsUDF
      },
      {
        get_product_function: GetProductUDF
      },
      {
        update_product_function: UpdateProductUDF
      },
      {
        delete_product_function: DeleteProductUDF
      },
      // Create Membership Roles
      {
        create_shop_owner_product_role: CreateShopOwnerProductRole(
          Select(["ref"], Var("create_product_function")),
          Select(["ref"], Var("get_all_products_function")),
          Select(["ref"], Var("get_product_function")),
          Select(["ref"], Var("update_product_function")),
          Select(["ref"], Var("delete_product_function")),
          Select(["ref"], Var("all_products_index")),
          Select(["ref"], Var("products_collection")),
        ),
      },
    ]
    ,{})
  )
}

async function deleteProductsCollection(client) {
  await client.query(DeleteIfExists(Collection(Products)))
  await client.query(DeleteIfExists(Index(All_Products)))
  await client.query(DeleteIfExists(Function(Create_Product)))
  await client.query(DeleteIfExists(Function(Get_All_Products)))
  await client.query(DeleteIfExists(Function(Get_Product)))
  await client.query(DeleteIfExists(Function(Update_Product)))
  await client.query(DeleteIfExists(Function(Delete_Product)))
  await client.query(DeleteIfExists(Role(CreateShopOwnerProductRole)))
}

module.exports = { createProductsCollection, deleteProductsCollection }
