const NETLIFY_FUNCTIONS = {
  Call_Function: "callFunction",
  Delete_S3_Files: "deleteS3Files",
  LogIn: "login",
  LogOut: "logout",
  Refresh_Fauna_Token: "refreshFaunaToken",
  Upload_Url: "uploadUrl",

};
Object.freeze(NETLIFY_FUNCTIONS)

module.exports = {
  NETLIFY_FUNCTIONS
}
