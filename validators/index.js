import { getShopSchema, createShopSchema, deleteShopSchema, updateShopSchema } from './shops'
import { getProductSchema, getAllProductsForShopSchema, createProductSchema, deleteProductSchema, updateProductSchema } from './products'
import { getAllImagesForEntitySchema, deleteImageSchema, createImagesSchema } from './images'

export {
  getShopSchema,
  createShopSchema,
  deleteShopSchema,
  updateShopSchema,

  getProductSchema,
  getAllProductsForShopSchema,
  createProductSchema,
  deleteProductSchema,
  updateProductSchema,
  
  getAllImagesForEntitySchema,
  deleteImageSchema,
  createImagesSchema
}