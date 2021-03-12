const INDEXES = {
  // Accounts
  All_Accounts: 'all_accounts',
  Accounts_By_Email: 'accounts_by_email',
  Access_Tokens_By_Session: 'access_tokens_by_session',
  Account_Sessions_By_Account: 'account_sessions_by_account',
  Tokens_By_Instance: 'tokens_by_instance',

  // Shops
  All_Shops: 'all_shops',
  Shop_For_Account: 'shop_for_account',
  Shop_By_Name: 'shop_by_name',

  // Products
  All_Products: 'all_products',
  All_Products_For_Shop: 'all_products_for_shop',

  // Images
  All_Images_For_Entity: 'all_images_for_entity',

  // Shopping Cart
  Shopping_Cart_For_Account: 'shopping_cart_for_account'
};
Object.freeze(INDEXES)

module.exports = {
  INDEXES
}
