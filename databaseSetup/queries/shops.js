const faunadb = require('faunadb')
const q = faunadb.query
const { Create, Collection, Map, Paginate, Index, Lambda, Get, Var, Match, Delete, Ref, CurrentIdentity, Update, If, Exists, Select, Let, GT, Count} = q

const { COLLECTIONS: { Shops } } = require('../../util/constants/database/collections')
const { INDEXES: { All_Shops, All_Shops_For_Account }} = require('../../util/constants/database/indexes')
const { HTTP_CODES: { Success, Not_Found, Validation_Error }} = require('../../util/constants/httpCodes')

function CreateShop(name) {
  return Let(
  {
    numShops: Count(Match(Index(All_Shops_For_Account), CurrentIdentity()))
  },
  If(
    GT(Var("numShops"), 0),
    {
      code: Validation_Error,
      message: "You cannot create more than 1 Shop"
    },
    {
      code: Success,
      message: "Shop Created",
      shop: Create(Collection(Shops), {
        data: {
          account: CurrentIdentity(),
          name,
        }
      })
    }
  ))
}

function GetAllShops() {
  return If(
    Exists(Index(All_Shops)), 
    {
      shops: Select(
        ["data"], 
        Map(
          Paginate(Match(Index(All_Shops))),
          Lambda("X", Get(Var("X")))
        )
      ),
      code: Success,
    },
    {
      code: Not_Found,
      message: "Could not find All_Shops Index"
    }
  )
}

function GetShop(id) {
  return If(
    Exists(Ref(Collection(Shops), id)),
    {
      shop: Get(Ref(Collection(Shops), id)),
      code: Success,
    },
    {
      code: Not_Found,
      message: "Shop not found"
    }
  )
}

function GetShopForAccount() {
  return If(
    Exists(Index(All_Shops_For_Account)), 
    {
      shop: Select(
        ["data", 0], 
        Map(
          Paginate(Match(Index(All_Shops_For_Account), CurrentIdentity())),
          Lambda("X", Get(Var("X")))
        ),
        {}
      ),
      code: Success,
    },
    {
      code: Not_Found,
      message: "Could not find All_Shops_For_Account Index"
    }
  )
}

function UpdateShop(id, name) {
  return If(
    Exists(Ref(Collection(Shops), id)),
      {
        updatedShop: Update(
          Ref(Collection(Shops), id),
          {
            data: {
              name
            }
          }
        ),
        code: Success,
        message: "Shop Updated"
    },
    {
      code: Not_Found,
      message: "Shop not found, could not update"
    }
  )
}

function DeleteShop(id) {
  return If(
    Exists(Ref(Collection(Shops), id)),
    {
      deletedShop: Delete(Ref(Collection(Shops), id)),
      code: Success,
      message: "Shop Deleted"
    },
    {
      code: Not_Found,
      message: "Shop not found, could not delete"
    }
  )
}
module.exports = { CreateShop, GetAllShops, GetShop, GetShopForAccount, UpdateShop, DeleteShop }
