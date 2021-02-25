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
  Get_All_Shops: 'get_all_shops',
  Delete_Shop: 'delete_shop',
  Update_Shop: 'update_shop',
  
  // Product Functions
  Create_Product: 'create_product',
  Get_All_Products: 'get_all_products',
  Delete_Product: 'delete_product',
  Get_Product: 'get_product',
  Update_Product: 'update_product',

  // Image Functions
  Create_Images: 'create_images',
  Get_All_Images_For_Entity: 'get_all_images_for_entity',
  Delete_Image: 'delete_image',
};
Object.freeze(FUNCTIONS)

module.exports = {
  FUNCTIONS
}
