const { LoginAccount, LogoutAllSessions, LogoutCurrentSession } = require('../queries/auth-login')
const { RegisterAccount } = require('../queries/auth-register')
const { CreateOrUpdateFunction } = require('../helpers/fql')
const { RefreshToken } = require('../queries/auth-refresh')
const { FUNCTION_ROLES: { FunctionRole_Register, FunctionRole_Login, FunctionRole_Refresh_Tokens_Logout }} = require('../../util/constants/database/functionRoles')
const { FUNCTIONS: { Register, Login, Refresh_Token, Logout_All, Logout }} = require('../../util/constants/database/functions')

const faunadb = require('faunadb')
const q = faunadb.query
const { Query, Lambda, Var, Role } = q

const RegisterUDF = CreateOrUpdateFunction({
  name: Register,
  body: Query(Lambda(['email', 'password'], RegisterAccount(Var('email'), Var('password')))),
  role: Role(FunctionRole_Register)
})

const LoginUDF = CreateOrUpdateFunction({
  name: Login,
  body: Query(Lambda(['email', 'password'], LoginAccount(Var('email'), Var('password')))),
  role: Role(FunctionRole_Login)
})

const RefreshTokenUDF = CreateOrUpdateFunction({
  name: Refresh_Token,
  body: Query(Lambda([], RefreshToken())),
  role: Role(FunctionRole_Refresh_Tokens_Logout)
})

const LogoutAllUDF = CreateOrUpdateFunction({
  name: Logout_All,
  body: Query(Lambda([], LogoutAllSessions())),
  role: Role(FunctionRole_Refresh_Tokens_Logout)
})

const LogoutUDF = CreateOrUpdateFunction({
  name: Logout,
  body: Query(Lambda([], LogoutCurrentSession())),
  role: Role(FunctionRole_Refresh_Tokens_Logout)
})

module.exports = { RegisterUDF, LoginUDF, RefreshTokenUDF, LogoutAllUDF, LogoutUDF }
