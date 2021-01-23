import { CreateAccessToken } from './auth-tokens.js'
import faunadb from 'faunadb'

const { Let, Get, Var, Select, CurrentIdentity } = faunadb.query

function RefreshToken() {
  return Let(
    {
      // First get the document that the token is linked with (from the 'account_sessions' collection )
      session: Get(CurrentIdentity())
    },
    Let(
      {
        account: Get(Select(['data', 'account'], Var('session'))),
        access: CreateAccessToken(Select(['ref'], Var('account')), Var('session'))
      },
      {
        account: Var('account'),
        access: Var('access')
      }
    )
  )
}

export { RefreshToken }
