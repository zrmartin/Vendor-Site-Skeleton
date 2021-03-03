const { IfNotExists, CreateOrUpdateRole, CreateOrUpdateFunction } = require('../helpers/fql')
const { CreateShoppingCart, GetShoppingCart, GetShoppingCartForAccount, UpdateShoppingCart, AddProductToShoppingCart, RemoveProductFromShoppingCart, ClearShoppingCart } = require('../queries/shoppingCarts')
const { COLLECTIONS: { ShoppingCarts, Accounts } } = require('../../util/constants/database/collections')
const { INDEXES: { Shopping_Cart_For_Account }} = require('../../util/constants/database/indexes')
const { FUNCTIONS: { Create_Shopping_Cart, Get_Shopping_Cart, Get_Shopping_Cart_For_Account, Update_Shopping_Cart, Add_Product_To_Shopping_Cart, Remove_Product_From_Shopping_Cart, Clear_Shopping_Cart}} = require('../../util/constants/database/functions')
const { MEMBERSHIP_ROLES: { MembershipRole_Shopping_Cart_Access }} = require('../../util/constants/database/membershipRoles')

const faunadb = require('faunadb')
const q = faunadb.query
const { Query, Lambda, Var, CreateCollection, CreateIndex, Collection, Index, Indexes, Select, Let, CurrentIdentity, Get, Equals, And } = q

/* Collection */
const CreateShoppingCartsCollection = CreateCollection({ name: ShoppingCarts })

/* Indexes */
const CreateIndexShoppingCartForAccount = (shoppingCartsCollection) => CreateIndex({
  name: Shopping_Cart_For_Account,
  source: shoppingCartsCollection,
  terms:[
    { field: ['data', 'account']}
  ],
  unique: true,
  serialized: true
})

/* Function Roles */

/* Functions */
const CreateShoppingCartUDF = CreateOrUpdateFunction({
  name: Create_Shopping_Cart,
  body: Query(Lambda(['data'], CreateShoppingCart(Select(['accountId'], Var('data'))))),
})

const GetShoppingCartForAccountUDF = CreateOrUpdateFunction({
  name: Get_Shopping_Cart_For_Account,
  body: Query(Lambda([], GetShoppingCartForAccount())),
})

const GetShoppingCartUDF = CreateOrUpdateFunction({
  name: Get_Shopping_Cart,
  body: Query(Lambda(['data'], GetShoppingCart(Select(['id'], Var('data'))))),
})

const UpdateShoppingCartUDF = CreateOrUpdateFunction({
  name: Update_Shopping_Cart,
  body: Query(Lambda(['data'], UpdateShoppingCart(Select(['id'], Var('data')), Select(['products'], Var('data'))))),
})

const AddProductToShoppingCartUDF = CreateOrUpdateFunction({
  name: Add_Product_To_Shopping_Cart,
  body: Query(Lambda(['data'], AddProductToShoppingCart(Select(['id'], Var('data')), Select(['productId'], Var('data')), Select(['quantity'], Var('data'))))),
})

const RemoveProductFromShoppingCartUDF = CreateOrUpdateFunction({
  name: Remove_Product_From_Shopping_Cart,
  body: Query(Lambda(['data'], RemoveProductFromShoppingCart(Select(['id'], Var('data')), Select(['productId'], Var('data'))))),
})

const ClearShoppingCartUDF = CreateOrUpdateFunction({
  name: Clear_Shopping_Cart,
  body: Query(Lambda(['data'], ClearShoppingCart(Select(['id'], Var('data'))))),
})

/* Membership Roles */
const CreateShoppingCartRole = (createShoppingCartFunction, getShoppingCartFunction, getShoppingCartForAccountFunction, updateShoppingCartFunction, addProductToShoppingCartFunction, removeProductFromShoppingCartFunction, clearShoppingCartFunction, shoppingCartForAccountIndex, shoppingCartCollection) => CreateOrUpdateRole({
  name: MembershipRole_Shopping_Cart_Access,
  membership: [{ 
    resource: Collection(Accounts)
  }],
  privileges: [
    {
      resource: createShoppingCartFunction,
      actions: {
        call: true
      }
    },
    {
      resource: getShoppingCartFunction,
      actions: {
        call: true
      }
    },
    {
      resource: getShoppingCartForAccountFunction,
      actions: {
        call: true
      }
    },
    {
      resource: updateShoppingCartFunction,
      actions: {
        call: true
      }
    },
    {
      resource: addProductToShoppingCartFunction,
      actions: {
        call: true
      }
    },
    {
      resource: removeProductFromShoppingCartFunction,
      actions: {
        call: true
      }
    },
    {
      resource: clearShoppingCartFunction,
      actions: {
        call: true
      }
    },
    {
      resource: shoppingCartForAccountIndex,
      actions: { read: true }
    },
    {
      resource: Indexes(),
      actions: { read: true }
    },
    {
      resource: shoppingCartCollection,
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
          Lambda("shoppingCartRef", Let(
            {
              shoppingCart: Get(Var("shoppingCartRef")),
              accountRef: Select(["data", "account"], Var("shoppingCart"))
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

async function createShoppingCartsCollection(client) {
  // Create Collection
  await client.query(
    Let([
      // Create Collections
      {
        shopping_cart_collection: IfNotExists(Collection(ShoppingCarts), CreateShoppingCartsCollection)
      },
      // Create Indexes
      {
        shopping_cart_for_account_index: IfNotExists(Index(Shopping_Cart_For_Account), CreateIndexShoppingCartForAccount(
          Select(["ref"], Var("shopping_cart_collection"))
        ))
      },
      // Create Function Roles
      // Create Functions
      {
        create_shopping_cart_function: CreateShoppingCartUDF
      },
      {
        get_shopping_cart_function: GetShoppingCartUDF
      },
      {
        get_shopping_cart_for_account_function: GetShoppingCartForAccountUDF
      },
      {
        update_shopping_cart_function: UpdateShoppingCartUDF
      },
      {
        add_product_to_shopping_cart_function: AddProductToShoppingCartUDF
      },
      {
        remove_product_from_shopping_cart_function: RemoveProductFromShoppingCartUDF
      },
      {
        clear_shopping_cart_function: ClearShoppingCartUDF
      },
      // Create Membership Roles
      {
        create_shopping_cart_role: CreateShoppingCartRole(
          Select(["ref"], Var("create_shopping_cart_function")),
          Select(["ref"], Var("get_shopping_cart_function")),
          Select(["ref"], Var("get_shopping_cart_for_account_function")),
          Select(["ref"], Var("update_shopping_cart_function")),
          Select(["ref"], Var("add_product_to_shopping_cart_function")),
          Select(["ref"], Var("remove_product_from_shopping_cart_function")),
          Select(["ref"], Var("clear_shopping_cart_function")),
          Select(["ref"], Var("shopping_cart_for_account_index")),
          Select(["ref"], Var("shopping_cart_collection")),
        ),
      },
    ]
    ,{})
  )
}

module.exports = { createShoppingCartsCollection }
