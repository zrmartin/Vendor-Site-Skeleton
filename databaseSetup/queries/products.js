const faunadb = require('faunadb')
const q = faunadb.query
const { Create, Collection, Map, Paginate, Index, Lambda, Get, Var, Match, Delete, Ref, CurrentIdentity, Update, If, Exists } = q

const { COLLECTIONS: { Products } } = require('../../util/constants/database/collections')
const { INDEXES: { All_Products }} = require('../../util/constants/database/indexes')

function CreateProduct(name, price, quantity) {
  return Create(Collection(Products), {
    data: {
      account: CurrentIdentity(),
      name,
      price,
      quantity
    }
  })
}

function GetAllProducts() {
  return Map(
    Paginate(Match(Index(All_Products))),
    Lambda("X", Get(Var("X")))
  )
}

function GetProduct(id) {
  return If(
    Exists(Ref(Collection(Products), id)),
    {
      data: Get(Ref(Collection(Products), id)),
      code: 200,
    },
    {
      code: 404
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
      code: 200,
    },
    {
      code: 404
    }
  )
}

function DeleteProduct(id) {
  return If(
    Exists(Ref(Collection(Products), id)),
    {
      data: Delete(Ref(Collection(Products), id)),
      code: 200,
    },
    {
      code: 404
    }
  )
}
module.exports = { CreateProduct, GetAllProducts, GetProduct, UpdateProduct,DeleteProduct }
