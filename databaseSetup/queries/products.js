import faunadb from 'faunadb'
const q = faunadb.query
const { Create, Collection, Map, Paginate, Index, Lambda, Get, Var, Match, Query } = q

function CreateProduct(name, price, quantity) {
  return Create(Collection('products'), {
    data: {
      name,
      price,
      quantity
    }
  })
}

function GetAllProducts() {
  return Map(
    Paginate(Match(Index("all_products"))),
    Lambda("X", Get(Var("X")))
  )
}

export { CreateProduct, GetAllProducts }
