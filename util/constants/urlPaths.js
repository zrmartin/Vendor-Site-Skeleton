const URL_PATHS = {
  Owner_Index_Page: '/owner',
  Product_Create_Page: '/owner/products/newProduct',
  Products_Index_Page: '/owner/products',
  Product_Index_Page: (slug) => `/owner/products/${slug}`
};
Object.freeze(URL_PATHS)

module.exports = {
  URL_PATHS
}
