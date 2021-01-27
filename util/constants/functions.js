const FUNCTIONS = {
  // User Auth Functions
  Register: 'register',
  Login: 'login',
  Refresh_Token: 'refresh_token',
  Logout_All: 'logout_all',
  Logout: 'logout',
  
  // Product Functions
  Create_Product: 'create_product',
  Get_All_Products: 'get_all_products',
};
Object.freeze(FUNCTIONS)

module.exports = {
  FUNCTIONS
}
