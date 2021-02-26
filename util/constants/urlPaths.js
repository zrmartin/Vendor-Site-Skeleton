const URL_PATHS = {
  // Owner
  Owner_Index_Page: '/owner',
  Owner_Shop_Page: '/owner/shop',
  Owner_Shop_Create_Page: 'owner/shop/createShop',
  Owner_Product_Create_Page: '/owner/shop/products/createProduct',
  Owner_Products_Index_Page: '/owner/shop/products',
  Owner_Product_Index_Page: (slug) => `/owner/shops/products/${slug}`,
  // Shops
  // Products
  Products_Index_Page: `/products/`,
  Product_Index_Page: (slug) => `/products/${slug}`
};
Object.freeze(URL_PATHS)

module.exports = {
  URL_PATHS
}
