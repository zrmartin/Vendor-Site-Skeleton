const INDEXES = {
  // Accounts
  All_Accounts: 'all_accounts',
  Accounts_By_Email: 'accounts_by_email',
  Access_Tokens_By_Session: 'access_tokens_by_session',
  Account_Sessions_By_Account: 'account_sessions_by_account',
  Tokens_By_Instance: 'tokens_by_instance',

  // Shops
  All_Shops: 'all_shops',
  All_Shops_For_Account: 'all_shops_for_account',

  // Products
  All_Products: 'all_products',
  All_Products_For_Account: 'all_products_for_account',

  // Images
  All_Images_For_Entity: 'all_images_for_entity'
};
Object.freeze(INDEXES)

module.exports = {
  INDEXES
}
