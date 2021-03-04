const FUNCTIONS = {
  // User Auth Functions
  Register: 'register',
  Login: 'login',
  Refresh_Token: 'refresh_token',
  Logout_All: 'logout_all',
  Logout: 'logout',

  // Shop Functions
  Create_Shop: 'create_shop',
  Get_Shop: 'get_shop',
  Get_Shop_For_Account: 'get_shop_for_account',
  Get_All_Shops: 'get_all_shops',
  Delete_Shop: 'delete_shop',
  Update_Shop: 'update_shop',
  
  // Product Functions
  Create_Product: 'create_product',
  Get_All_Products: 'get_all_products',
  Get_All_Products_For_Shop: 'get_all_products_for_shop',
  Delete_Product: 'delete_product',
  Get_Product: 'get_product',
  Update_Product: 'update_product',

  // Image Functions
  Create_Images: 'create_images',
  Get_All_Images_For_Entity: 'get_all_images_for_entity',
  Delete_Image: 'delete_image',

  // Shopping Cart Functions
  Create_Shopping_Cart: 'create_shopping_cart',
  Get_Shopping_Cart: 'get_shopping_cart',
  Get_Shopping_Cart_For_Account: 'get_shopping_cart_for_account',
  Get_Shopping_Cart_Products_For_Account: 'get_shopping_cart_products_for_account',
  Update_Shopping_Cart: 'update_shopping_cart',
  Add_Product_To_Shopping_Cart: 'add_product_to_shopping_cart',
  Remove_Product_From_Shopping_Cart: 'remove_product_from_shopping_cart',
  Clear_Shopping_Cart: 'clear_shopping_cart',
};
Object.freeze(FUNCTIONS)

module.exports = {
  FUNCTIONS
}
