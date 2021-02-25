const { IfNotExists, CreateOrUpdateRole, CreateOrUpdateFunction } = require('../helpers/fql')
const { CreateShop, GetShop, GetAllShops, DeleteShop, UpdateShop } = require('../queries/shops')
const { COLLECTIONS: { Accounts, Shops } } = require('../../util/constants/database/collections')
const { INDEXES: { All_Shops, All_Shops_For_Account }} = require('../../util/constants/database/indexes')
const { FUNCTIONS: { Create_Shop, Get_Shop, Get_All_Shops, Delete_Shop, Update_Shop }} = require('../../util/constants/database/functions')
const { MEMBERSHIP_ROLES: { MembershipRole_Shop_Owner_Shop_Access }} = require('../../util/constants/database/membershipRoles')
const { ROLES: { owner }} = require('../../util/constants/roles')

const faunadb = require('faunadb')
const q = faunadb.query
const { Query, Lambda, Var, CreateCollection, CreateIndex, Collection, Index, If, Select, Let, CurrentIdentity, Get, Equals, Indexes, And, ContainsValue } = q

/* Collection */
const CreateShopsCollection = CreateCollection({ name: Shops })

/* Indexes */
const CreateIndexAllShops = (shopCollection) => CreateIndex({
  name: All_Shops,
  source: shopCollection,
  // this is the default collection index, no terms or values are provided
  // which means the index will sort by reference and return only the reference.
  serialized: true
})

const CreateIndexAllShopsForAccount = (shopCollection) => CreateIndex({
  name: All_Shops_For_Account,
  source: shopCollection,
  terms:[
    { field: ['data', 'account']}
  ],
  serialized: true
})

/* Function Roles */

/* Functions */
const CreateShopUDF = CreateOrUpdateFunction({
  name: Create_Shop,
  body: Query(Lambda(['data'], CreateShop(Select(['name'], Var('data'))))),
})

const GetShopUDF = CreateOrUpdateFunction({
  name: Get_Shop,
  body: Query(Lambda(['data'], GetShop(Select(['id'], Var('data'))))),
})

const GetAllShopsUDF = CreateOrUpdateFunction({
  name: Get_All_Shops,
  body: Query(Lambda([], GetAllShops())),
})

const DeleteShopUDF = CreateOrUpdateFunction({
  name: Delete_Shop,
  body: Query(Lambda(['data'], DeleteShop(Select(['id'], Var('data'))))),
})

const UpdateShopUDF = CreateOrUpdateFunction({
  name: Update_Shop,
  body: Query(Lambda(['data'], UpdateShop(Select(['id'], Var('data')), Select(['name'], Var('data'))))),
})

/* Membership Roles */
const CreateShopOwnerShopRole = (createShopFunction, getAllShopsFunction, getShopFunction, updateShopFunction, deleteShopFunction, allShopsIndex, allShopsForAccountIndex, shopsCollection) => CreateOrUpdateRole({
  name: MembershipRole_Shop_Owner_Shop_Access,
  membership: [{ 
    resource: Collection(Accounts),
    predicate:
    Query(
      Lambda(
        "accountRef",
        ContainsValue(owner, Select(["data","roles"], Get(Var("accountRef"))))
      )
    )
  }],
  privileges: [
    {
      resource: createShopFunction,
      actions: {
        call: true
      }
    },
    {
      resource: getAllShopsFunction,
      actions: {
        call: true
      }
    },
    {
      resource: getShopFunction,
      actions: {
        call: true
      }
    },
    {
      resource: updateShopFunction,
      actions: {
        call: true
      }
    },
    {
      resource: deleteShopFunction,
      actions: {
        call: true
      }
    },
    {
      resource: allShopsIndex,
      actions: { read: true }
    },
    {
      resource: allShopsForAccountIndex,
      actions: { read: true }
    },
    {
      resource: Indexes(),
      actions: { read: true }
    },
    {
      resource: shopsCollection,
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
          Lambda("shopRef", Let(
            {
              shop: Get(Var("shopRef")),
              accountRef: Select(["data", "account"], Var("shop"))
            },
            Equals(Var("accountRef"), CurrentIdentity())
          ))
        ), 
        create: true,
        read: true,
      }
    }
  ]
})

async function createShopsCollection(client) {
  // Create Collection
  await client.query(
    Let([
      // Create Collections
      {
        shops_collection: IfNotExists(Collection(Shops), CreateShopsCollection)
      },
      // Create Indexes
      {
        all_shops_index: IfNotExists(Index(All_Shops), CreateIndexAllShops(
          Select(["ref"], Var("shops_collection"))
        ))
      },
      {
        all_shops_for_account_index: IfNotExists(Index(All_Shops_For_Account), CreateIndexAllShopsForAccount(
          Select(["ref"], Var("shops_collection"))
        ))
      },
      // Create Function Roles
      // Create Functions
      {
        create_shop_function: CreateShopUDF
      },
      {
        get_all_shops_function: GetAllShopsUDF
      },
      {
        get_shop_function: GetShopUDF
      },
      {
        update_shop_function: UpdateShopUDF
      },
      {
        delete_shop_function: DeleteShopUDF
      },
      // Create Membership Roles
      {
        create_shop_owner_shop_role: CreateShopOwnerShopRole(
          Select(["ref"], Var("create_shop_function")),
          Select(["ref"], Var("get_all_shops_function")),
          Select(["ref"], Var("get_shop_function")),
          Select(["ref"], Var("update_shop_function")),
          Select(["ref"], Var("delete_shop_function")),
          Select(["ref"], Var("all_shops_index")),
          Select(["ref"], Var("all_shops_for_account_index")),
          Select(["ref"], Var("shops_collection")),
        ),
      },
    ]
    ,{})
  )
}

module.exports = { createShopsCollection }
