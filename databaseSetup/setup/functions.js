import { LoginAccount, LogoutAllSessions, LogoutCurrentSession } from '../queries/auth-login.js'
import { RegisterAccount } from '../queries/auth-register.js'

import { CreateOrUpdateFunction } from '../helpers/fql.js'
import { RefreshToken } from '../queries/auth-refresh.js'

import faunadb from 'faunadb'
const q = faunadb.query
const { Query, Lambda, Var } = q

const RegisterUDF = CreateOrUpdateFunction({
  name: 'register',
  body: Query(Lambda(['email', 'password'], RegisterAccount(Var('email'), Var('password')))),
})

const LoginUDF = CreateOrUpdateFunction({
  name: 'login',
  body: Query(Lambda(['email', 'password'], LoginAccount(Var('email'), Var('password')))),
})

const RefreshTokenUDF = CreateOrUpdateFunction({
  name: 'refresh_token',
  body: Query(Lambda([], RefreshToken())),
})

const LogoutAllUDF = CreateOrUpdateFunction({
  name: 'logout_all',
  body: Query(Lambda([], LogoutAllSessions())),
})

const LogoutUDF = CreateOrUpdateFunction({
  name: 'logout',
  body: Query(Lambda([], LogoutCurrentSession())),
})

export { RegisterUDF, LoginUDF, RefreshTokenUDF, LogoutAllUDF, LogoutUDF }
