const faunadb = require('faunadb')
const q = faunadb.query
const { Create, Collection, Map, Paginate, Index, Lambda, Get, Var, Match, Delete, Ref, CurrentIdentity, Update, If, Exists, And, IsString, IsInteger, IsDouble, Not } = q

const { COLLECTIONS: { Products } } = require('../../util/constants/database/collections')
const { INDEXES: { All_Products }} = require('../../util/constants/database/indexes')
const { HTTP_CODES: { Success, Not_Found }} = require('../../util/constants/httpCodes')

function CreateProduct(name, price, quantity) {
  return {
    code: Success,
    message: "Product Created",
    data: Create(Collection(Products), {
      data: {
        account: CurrentIdentity(),
        name,
        price,
        quantity
      }
    })
  }
}

function GetAllProducts() {
  return If(
    Exists(Index(All_Products)), 
    {
      data: Map(
        Paginate(Match(Index(All_Products))),
        Lambda("X", Get(Var("X")))
      ),
      code: Success,
    },
    {
      code: Not_Found,
      message: "Could not find All_Products Index"
    }
  )
}

function GetProduct(id) {
  return If(
    Exists(Ref(Collection(Products), id)),
    {
      data: Get(Ref(Collection(Products), id)),
      code: Success,
    },
    {
      code: Not_Found,
      message: "Product not found"
    }
  )
}

function UpdateProduct(id, name, price, quantity) {
  return If(
    Exists(Ref(Collection(Products), id)),
      {
        data: Update(
          Ref(Collection(Products), id),
          {
            data: {
              name,
              price,
              quantity
            }
          }
        ),
        code: Success,
        message: "Product Updated"
    },
    {
      code: Not_Found,
      message: "Product not found, could not update"
    }
  )
}

function DeleteProduct(id) {
  return If(
    Exists(Ref(Collection(Products), id)),
    {
      data: Delete(Ref(Collection(Products), id)),
      code: Success,
      message: "Product Deleted"
    },
    {
      code: Not_Found,
      message: "Product not found, could not delete"
    }
  )
}
module.exports = { CreateProduct, GetAllProducts, GetProduct, UpdateProduct, DeleteProduct }
