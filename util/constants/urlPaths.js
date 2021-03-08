const URL_PATHS = {
  // Home
  Home_Page: '/',

  // Owner
  Owner_Index_Page: '/owner',
  Owner_Shop_Create_Page: '/owner/shop/createShop',
  Owner_Shop_Index_Page: `/owner/shop`,
  Owner_Product_Create_Page:`/owner/shop/products/createProduct`,
  Owner_Products_Index_Page:`/owner/shop/products`,
  Owner_Product_Index_Page: ({productId}) => `/owner/shop/products/${productId}`,
  
  // Products
  Products_Index_Page: `/products/`,
  Product_Index_Page: (slug) => `/products/${slug}`,

  // Shopping Cart
  Shopping_Cart_Index_Page: '/shoppingCart',

  // Checkout
  Checkout_Index_Page: '/checkout'
};
Object.freeze(URL_PATHS)

module.exports = {
  URL_PATHS
}
