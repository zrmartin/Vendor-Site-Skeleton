const faunadb = require('faunadb')
const q = faunadb.query
const { Create, Collection, Map, Paginate, Index, Lambda, Get, Var, Match, Add, Ref, CurrentIdentity, Update, If, Exists, Select, Replace, Equals, Let, ToObject } = q

const { COLLECTIONS: { ShoppingCarts, Accounts } } = require('../../util/constants/database/collections')
const { INDEXES: { Shopping_Cart_For_Account }} = require('../../util/constants/database/indexes')
const { HTTP_CODES: { Success, Not_Found }} = require('../../util/constants/httpCodes')

function CreateShoppingCart(accountId) {
  return {
    code: Success,
    shoppingCart: Create(Collection(ShoppingCarts), {
      data: {
        account: Ref(Collection(Accounts), accountId),
        products: {}
      }
    })
  }
}

function GetShoppingCartForAccount() {
  return If(
    Exists(Index(Shopping_Cart_For_Account)), 
    {
      shoppingCart: Select(
        ["data", 0], 
        Map(
          Paginate(Match(Index(Shopping_Cart_For_Account), CurrentIdentity())),
          Lambda("X", Get(Var("X")))
        ),
        {}
      ),
      code: Success,
    },
    {
      code: Not_Found,
      message: "Could not find Shopping_Cart_For_Account Index"
    }
  )
}

function GetShoppingCart(id) {
  return If(
    Exists(Ref(Collection(ShoppingCarts), id)),
    {
      shoppingCart: Get(Ref(Collection(ShoppingCarts), id)),
      code: Success,
    },
    {
      code: Not_Found,
      message: "Shopping Cart not found"
    }
  )
}

function UpdateShoppingCart(id, products) {
  return If(
    Exists(Ref(Collection(ShoppingCarts), id)),
    {
      updatedShoppingCart: Update(
        Ref(Collection(ShoppingCarts), id),
        {
          data: {
            products
          }
        }
      ),
      code: Success,
      message: "Shopping Cart Updated"
    },
    {
      code: Not_Found,
      message: "Shopping Cart not found, could not update"
    }
  )
}

function AddProductToShoppingCart(id, productId, quantity) {
  return If(
    Exists(Ref(Collection(ShoppingCarts), id)),
    {
      updatedShoppingCart: Update(
        Ref(Collection(ShoppingCarts), id),
        {
          data: {
            products: ToObject([[productId, quantity]])
          }
        }
      ),
      code: Success,
      message: "Product Added"
    },
    {
      code: Not_Found,
      message: "Shopping Cart not found, could not add product"
    }
  )
}


function RemoveProductFromShoppingCart(id, productId) {
  return If(
    Exists(Ref(Collection(ShoppingCarts), id)),
    {
      updatedShoppingCart: Update(
        Ref(Collection(ShoppingCarts), id),
        {
          data: {
            products: ToObject([[productId, null]])
          }
        }
      ),
      code: Success,
      message: "Product Removed"
    },
    {
      code: Not_Found,
      message: "Shopping Cart not found, could not remove product"
    }
  )
}

function ClearShoppingCart(id) {
  return If(
    Exists(Ref(Collection(ShoppingCarts), id)),
    {
      updatedShoppingCart: Replace(
        Ref(Collection(ShoppingCarts), id),
        {
          data: {
            products: {}
          }
        }
      ),
      code: Success,
      message: "Shopping Cart Cleared"
    },
    {
      code: Not_Found,
      message: "Shopping Cart not found, could not clear"
    }
  )
}
module.exports = { CreateShoppingCart, GetShoppingCartForAccount, GetShoppingCart, UpdateShoppingCart, AddProductToShoppingCart, RemoveProductFromShoppingCart, ClearShoppingCart }
