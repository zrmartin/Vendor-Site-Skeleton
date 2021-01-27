const INDEXES = {
  // Accounts
  All_Accounts: 'all_accounts',
  Accounts_By_Email: 'accounts_by_email',
  Access_Tokens_By_Session: 'access_tokens_by_session',
  Account_Sessions_By_Account: 'account_sessions_by_account',
  Tokens_By_Instance: 'tokens_by_instance',

  // Products
  All_Products: 'all_products',
};
Object.freeze(INDEXES)

module.exports = {
  INDEXES
}
