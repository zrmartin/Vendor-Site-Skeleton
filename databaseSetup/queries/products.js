const faunadb = require('faunadb')
const q = faunadb.query
const { Create, Collection, Map, Paginate, Index, Lambda, Get, Var, Match } = q

const { COLLECTIONS: { Products } } = require('../../util/constants/collections')
const { INDEXES: { All_Products }} = require('../../util/constants/indexes')

function CreateProduct(name, price, quantity) {
  return Create(Collection(Products), {
    data: {
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
module.exports = { CreateProduct, GetAllProducts }
