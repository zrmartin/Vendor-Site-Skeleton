const URL_PATHS = {
  // Owner
  Owner_Index_Page: '/owner',
  Owner_Product_Create_Page: '/owner/products/newProduct',
  Owner_Products_Index_Page: '/owner/products',
  Owner_Product_Index_Page: (slug) => `/owner/products/${slug}`,
  // Products
  Products_Index_Page: `/products/`,
  Product_Index_Page: (slug) => `/products/${slug}`
};
Object.freeze(URL_PATHS)

module.exports = {
  URL_PATHS
}
