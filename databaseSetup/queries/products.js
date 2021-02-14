const faunadb = require('faunadb')
const q = faunadb.query
const { Create, Collection, Map, Paginate, Index, Lambda, Get, Var, Match, Delete, Ref, CurrentIdentity, Update, If, Exists, Select, Call, Function } = q

const { COLLECTIONS: { Products } } = require('../../util/constants/database/collections')
const { INDEXES: { All_Products, All_Images_For_Entity }} = require('../../util/constants/database/indexes')
const { FUNCTIONS: { Get_All_Images_For_Entity }} = require('../../util/constants/database/functions')
const { HTTP_CODES: { Success, Not_Found }} = require('../../util/constants/httpCodes')

function CreateProduct(name, price, quantity) {
  return {
    code: Success,
    message: "Product Created",
    product: Create(Collection(Products), {
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
      products: Select(
        ["data"], 
        Map(
          Paginate(Match(Index(All_Products))),
          Lambda("X", Get(Var("X")))
        )
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
      product: Get(Ref(Collection(Products), id)),
      images: Select(["images", "data"], Call(Function(Get_All_Images_For_Entity), {entityId: id, entityCollection: Products})),
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
        updatedProduct: Update(
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
      deletedProduct: Delete(Ref(Collection(Products), id)),
      deletedImages: Map(
        Paginate(Match(Index(All_Images_For_Entity), Ref(Collection(Products), id))),
        Lambda("Image", Delete(Var("Image")))
      ),
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
