const URL_PATHS = {
  // Owner
  Owner_Index_Page: '/owner',
  Owner_Shop_Create_Page: 'owner/shop/createShop',
  Owner_Shop_Index_Page: (shopId) => `/owner/shop/${shopId}`,
  Owner_Product_Create_Page: (shopId) => `/owner/shop/${shopId}/products/createProduct`,
  Owner_Products_Index_Page: (shopId) => `/owner/shop/${shopId}/products`,
  Owner_Product_Index_Page: (shopId, productId) => `/owner/shop/${shopId}/products/${productId}`,
  
  // Products
  Products_Index_Page: `/products/`,
  Product_Index_Page: (slug) => `/products/${slug}`,

  // Shopping Cart
  Shopping_Cart_Index_Page: '/shoppingCart'
};
Object.freeze(URL_PATHS)

module.exports = {
  URL_PATHS
}
